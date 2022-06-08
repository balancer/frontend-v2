import { formatUnits } from 'ethers/lib/utils';
import { flatten, keyBy } from 'lodash';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum, forChange } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import PoolService from '@/services/pool/pool.service';
import { PoolWithShares } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';
import { isStablePhantom, lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

type UserPoolsQueryResponse = {
  pools: PoolWithShares[];
  totalInvestedAmount: string;
  tokens: string[];
};

export default function useUserPoolsQuery(
  options: UseQueryOptions<UserPoolsQueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const {
    injectTokens,
    prices,
    dynamicDataLoading,
    getTokens,
    tokens: tokenMeta
  } = useTokens();
  const { account, isWalletReady } = useWeb3();
  const { currency } = useUserSettings();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();

  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );
  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && account.value != null);

  /**
   * QUERY PROPERTIES
   */
  const queryKey = reactive(
    QUERY_KEYS.Pools.User(networkId, account, gaugeAddresses)
  );

  const queryFn = async () => {
    const poolShares = await balancerSubgraphService.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase()
      }
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    const pools = await balancerSubgraphService.pools.get({
      where: {
        id_in: poolSharesIds,
        poolType_not_in: POOLS.ExcludedPoolTypes
      }
    });

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
      pools.map(pool => {
        return [
          ...pool.tokensList,
          ...lpTokensFor(pool),
          balancerSubgraphService.pools.addressFor(pool.id)
        ];
      })
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

    const poolsWithShares = decoratedPools.map(pool => ({
      ...pool,
      shares: bnum(pool.totalLiquidity)
        .div(pool.totalShares)
        .times(poolSharesMap[pool.id].balance)
        .toString(),
      bpt: poolSharesMap[pool.id].balance
    }));

    const totalInvestedAmount = poolsWithShares
      .map(pool => pool.shares)
      .reduce((totalShares, shares) => totalShares.plus(shares), bnum(0))
      .toString();

    return {
      pools: poolsWithShares,
      tokens,
      totalInvestedAmount
    };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<UserPoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
