import { QueryObserverOptions } from 'react-query/core';
import { computed, ComputedRef, reactive } from 'vue';
import { useQuery } from 'vue-query';

import { getTimeTravelBlock } from '@/composables/useSnapshots';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { AprConcern } from '@/services/pool/concerns/apr/apr.concern';
import { singlePoolService } from '@/services/pool/single-pool.service';
import { Pool, PoolAPRs } from '@/services/pool/types';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';

import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

/**
 * HELPERS
 */
export default function usePoolAprQuery(
  id: string,
  pool: ComputedRef<Pool>,
  options: QueryObserverOptions<PoolAPRs> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const poolInfo = singlePoolService.findPool(id);

  /**
   * COMPOSABLES
   */
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
  const enabled = computed(() => !!pool.value?.id || !!poolInfo);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.APR(networkId, id);

  async function getSnapshot(id: string): Promise<Pool[]> {
    const currentBlock = await rpcProviderService.getBlockNumber();
    const blockNumber = getTimeTravelBlock(currentBlock);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: [id] };
    try {
      const data = await balancerSubgraphService.pools.get({
        where: isInPoolIds,
        block
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch pool snapshots', error);
      return [];
    }
  }

  const queryFn = async () => {
    if (!pool.value && !poolInfo) throw new Error('No pool');

    if (poolInfo?.apr) {
      return poolInfo.apr;
    }

    // copy computed pool to avoid mutation warnings
    const _pool = poolInfo || { ...pool.value, tokens: [...pool.value.tokens] };

    const payload = {
      pools: [_pool],
      prices: prices.value,
      gauges: subgraphGauges.value || []
    };
    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs
    ] = await Promise.all([
      balancerContractsService.vault.protocolFeesCollector.getSwapFeePercentage(),
      stakingRewardsService.getGaugeBALAprs(payload),
      stakingRewardsService.getRewardTokenAprs({
        ...payload,
        tokens: tokens.value
      })
    ]);

    const _snaphshot = await getSnapshot(id);
    const apr = await new AprConcern(_pool).calc(
      _snaphshot[0],
      prices.value,
      currency.value,
      protocolFeePercentage,
      gaugeBALAprs[id],
      gaugeRewardTokenAprs[id]
    );

    return apr;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<PoolAPRs>(queryKey, queryFn, queryOptions);
}
