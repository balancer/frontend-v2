import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import { getTimeTravelBlock } from '@/composables/useSnapshots';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { AprConcern } from '@/services/pool/concerns/apr/apr.concern';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';

import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import usePoolQuery from './usePoolQuery';
import { AprBreakdown } from '@balancer-labs/sdk';
import _ from 'lodash';

export default function usePoolAprQuery(
  id: string,
  options: QueryObserverOptions<AprBreakdown> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id);

  /**
   * COMPOSABLES
   */
  const poolQuery = usePoolQuery(id);
  const { prices } = useTokens();
  const { currency } = useUserSettings();
  const { tokens } = useTokens();
  const { data: subgraphGauges } = useGaugesQuery();

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id || !!storedPool);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.APR(networkId, id);

  async function getSnapshot(id: string): Promise<Pool[]> {
    const blockNumber = await getTimeTravelBlock();
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: [id] };
    try {
      const data = await balancerSubgraphService.pools.get({
        where: isInPoolIds,
        block,
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch pool snapshots', error);
      return [];
    }
  }

  const queryFn = async (): Promise<AprBreakdown> => {
    let _pool: Pool;
    if (storedPool) {
      _pool = storedPool;
    } else if (pool.value) {
      // copy computed pool to avoid mutation warnings
      _pool = { ...pool.value, tokens: [...pool.value.tokens] };
    } else {
      throw new Error('No pool');
    }

    if (storedPool?.apr) {
      return storedPool.apr;
    }

    _pool.chainId = networkId.value;

    const payload = {
      pools: [_pool],
      prices: prices.value,
      gauges: subgraphGauges.value || [],
    };

    const [protocolFeePercentage, gaugeBALAprs, gaugeRewardTokenAprs] =
      await Promise.all([
        balancerContractsService.vault.protocolFeesCollector.getSwapFeePercentage(),
        stakingRewardsService.getGaugeBALAprs(payload),
        stakingRewardsService.getRewardTokenAprs({
          ...payload,
          tokens: tokens.value,
        }),
      ]);

    // const _snapshot = await getSnapshot(_pool.id);
    const apr = await new AprConcern(_pool).calc();

    return apr;
  };
  const queryOptions = reactive({
    enabled,
    ...options,
  });
  return useQuery<AprBreakdown>(queryKey, queryFn, queryOptions);
}
