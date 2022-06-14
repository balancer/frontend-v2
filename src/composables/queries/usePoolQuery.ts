import { getAddress, isAddress } from '@ethersproject/address';
import { formatUnits } from 'ethers/lib/utils';
import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum, forChange } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import PoolService from '@/services/pool/pool.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useApp from '../useApp';
import {
  isManaged,
  isStableLike,
  isStablePhantom,
  lpTokensFor
} from '../usePool';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryObserverOptions<Pool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { getTokens, injectTokens, prices, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { account } = useWeb3();
  const { currency } = useUserSettings();
  const { data: subgraphGauges } = useGaugesQuery();
  const { tokens } = useTokens();

  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value && isEnabled.value
  );

  /**
   * METHODS
   */
  function isBlocked(pool: Pool): boolean {
    const requiresAllowlisting =
      isStableLike(pool.poolType) || isManaged(pool.poolType);
    const isOwnedByUser =
      isAddress(account.value) &&
      getAddress(pool.owner) === getAddress(account.value);
    const isAllowlisted =
      POOLS.Stable.AllowList.includes(id) ||
      POOLS.Investment.AllowList.includes(id);

    return requiresAllowlisting && !isAllowlisted && !isOwnedByUser;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id, gaugeAddresses);

  const queryFn = async () => {
    let [pool] = await balancerSubgraphService.pools.get({
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1, // Avoid the filtering for low liquidity pools
        poolType_not_in: POOLS.ExcludedPoolTypes
      }
    });

    if (isBlocked(pool)) throw new Error('Pool not allowed');

    const isStablePhantomPool = isStablePhantom(pool.poolType);

    if (isStablePhantomPool) {
      const poolService = new PoolService(pool);
      poolService.removePreMintedBPT();
      await poolService.setLinearPools();
      pool = poolService.pool;
    }

    // Inject relevant pool tokens to fetch metadata
    await injectTokens([
      ...pool.tokensList,
      ...lpTokensFor(pool),
      balancerSubgraphService.pools.addressFor(pool.id)
    ]);
    await forChange(dynamicDataLoading, false);

    // Need to fetch onchain pool data first so that calculations can be
    // performed in the decoration step.
    const poolTokenMeta = getTokens(pool.tokensList);
    const onchainData = await balancerContractsService.vault.getPoolData(
      id,
      pool.poolType,
      poolTokenMeta
    );

    const [decoratedPool] = await balancerSubgraphService.pools.decorate(
      [{ ...pool, onchain: onchainData }],
      '24h',
      prices.value,
      currency.value,
      subgraphGauges.value || [],
      tokens.value
    );

    let unwrappedTokens: Pool['unwrappedTokens'];

    if (isStablePhantomPool && onchainData.linearPools != null) {
      unwrappedTokens = Object.entries(onchainData.linearPools).map(
        ([, linearPool]) => linearPool.unwrappedTokenAddress
      );

      if (decoratedPool.linearPoolTokensMap != null) {
        let totalLiquidity = bnum(0);
        const tokensMap = getTokens(
          Object.keys(decoratedPool.linearPoolTokensMap)
        );

        Object.entries(onchainData.linearPools).forEach(([address, token]) => {
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
        });

        decoratedPool.totalLiquidity = totalLiquidity.toString();
      }
    }

    return { onchain: onchainData, unwrappedTokens, ...decoratedPool };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<Pool>(queryKey, queryFn, queryOptions);
}
