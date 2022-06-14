import { formatUnits } from '@ethersproject/units';
import { flatten } from 'lodash';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum, forChange } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import PoolService from '@/services/pool/pool.service';
import { Pool } from '@/services/pool/types';

import useApp from '../useApp';
import useNetwork from '../useNetwork';
import { isStablePhantom, lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

type PoolsQueryResponse = {
  pools: Pool[];
  tokens: string[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // COMPOSABLES
  const {
    injectTokens,
    dynamicDataLoading,
    prices,
    getTokens,
    tokens: tokenMeta
  } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();
  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    tokenList,
    filterOptions?.poolIds,
    filterOptions?.poolAddresses,
    gaugeAddresses
  );

  // COMPUTED
  const enabled = computed(() => !appLoading.value && options.enabled);

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
    if (filterOptions?.poolAddresses?.value.length) {
      queryArgs.where.address_in = filterOptions.poolAddresses.value;
    }
    const pools = await balancerSubgraphService.pools.get(queryArgs);

    for (let i = 0; i < pools.length; i++) {
      const isStablePhantomPool = isStablePhantom(pools[i].poolType);

      if (isStablePhantomPool) {
        const poolService = new PoolService(pools[i]);
        poolService.removePreMintedBPT();
        await poolService.setLinearPools();
        pools[i] = poolService.pool;
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
      currency.value,
      subgraphGauges.value || [],
      tokenMeta.value
    );
    // TODO - cleanup and extract elsewhere in refactor
    for (let i = 0; i < decoratedPools.length; i++) {
      const isStablePhantomPool = isStablePhantom(decoratedPools[i].poolType);

      if (isStablePhantomPool) {
        const decoratedPool = decoratedPools[i];

        const poolTokenMeta = getTokens(decoratedPool.tokensList);

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
    ...options,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    enabled
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
