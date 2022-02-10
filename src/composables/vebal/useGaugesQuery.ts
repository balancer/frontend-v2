import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { flatten } from 'lodash';
import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  DecoratedPool,
  LinearPool,
  Pool
} from '@/services/balancer/subgraph/types';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useApp from '../useApp';
import { bnum, forChange } from '@/lib/utils';
import useNetwork from '../useNetwork';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { isStablePhantom, lpTokensFor } from '../usePool';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

export default function useGaugesQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {

 

  const queryFn = async ({ pageParam = 0 }) => {
    const tokensListFilterKey = filterOptions?.isExactTokensList
      ? 'tokensList'
      : 'tokensList_contains';
    const queryArgs: any = {
      first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        [tokensListFilterKey]: tokenList.value,
        poolType_not_in: POOLS.ExcludedPoolTypes
      }
    };
    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.id_in = filterOptions.poolIds.value;
    }

    const pools = await balancerSubgraphService.pools.get(queryArgs);

    for (let i = 0; i < pools.length; i++) {
      const isStablePhantomPool = isStablePhantom(pools[i].poolType);

      if (isStablePhantomPool) {
        pools[i] = removePreMintedBPT(pools[i]);
        pools[i] = await getLinearPoolAttrs(pools[i]);
      }
    }

    const tokens = flatten(
      pools.map(pool => [
        ...pool.tokensList,
        ...lpTokensFor(pool),
        balancerSubgraphService.pools.addressFor(pool.id)
      ])
    );
    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);

    const decoratedPools = await balancerSubgraphService.pools.decorate(
      pools,
      '24h',
      prices.value,
      currency.value
    );

    // TODO - cleanup and extract elsewhere in refactor
    for (let i = 0; i < decoratedPools.length; i++) {
      const isStablePhantomPool = isStablePhantom(decoratedPools[i].poolType);

      if (isStablePhantomPool) {
        const decoratedPool = decoratedPools[i];

        const poolTokenMeta = getTokens(
          decoratedPool.tokensList.map(address => getAddress(address))
        );

        const onchainData = await balancerContractsService.vault.getPoolData(
          decoratedPool.id,
          decoratedPool.poolType,
          poolTokenMeta
        );

        if (
          onchainData != null &&
          onchainData.linearPools != null &&
          decoratedPool.linearPoolTokensMap != null
        ) {
          let totalLiquidity = bnum(0);
          const tokensMap = getTokens(
            Object.keys(decoratedPool.linearPoolTokensMap)
          );

          Object.entries(onchainData.linearPools).forEach(
            ([address, token]) => {
              const tokenShare = bnum(onchainData.tokens[address].balance).div(
                token.totalSupply
              );

              const mainTokenBalance = formatUnits(
                token.mainToken.balance,
                tokensMap[token.mainToken.address].decimals
              );

              const wrappedTokenBalance = formatUnits(
                token.wrappedToken.balance,
                tokensMap[token.wrappedToken.address].decimals
              );

              const mainTokenPrice =
                prices.value[token.mainToken.address] != null
                  ? prices.value[token.mainToken.address].usd
                  : null;

              if (mainTokenPrice != null) {
                const mainTokenValue = bnum(mainTokenBalance)
                  .times(tokenShare)
                  .times(mainTokenPrice);

                const wrappedTokenValue = bnum(wrappedTokenBalance)
                  .times(tokenShare)
                  .times(mainTokenPrice)
                  .times(token.wrappedToken.priceRate);

                totalLiquidity = bnum(totalLiquidity)
                  .plus(mainTokenValue)
                  .plus(wrappedTokenValue);
              }
            }
          );

          decoratedPools[i].onchain = onchainData;
          decoratedPools[i].totalLiquidity = totalLiquidity.toString();

          const miningTotalLiquidity = balancerSubgraphService.pools.removeExcludedAddressesFromTotalLiquidity(
            decoratedPools[i],
            decoratedPools[i].totalLiquidity
          );

          decoratedPools[i].miningTotalLiquidity = miningTotalLiquidity;
        }
      }
    }

    return {
      pools: decoratedPools,
      tokens,
      skip:
        pools.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
