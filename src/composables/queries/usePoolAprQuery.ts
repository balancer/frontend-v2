import { QueryObserverOptions } from 'react-query/core';
import { computed, ComputedRef, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { getTimeTravelBlock } from '@/composables/useSnapshots';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancer } from '@/lib/balancer.sdk';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { singlePoolService } from '@/services/pool/single-pool.service';
import { Pool, PoolAPRs } from '@/services/pool/types';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';

import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import { bnum } from '@/lib/utils';

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

  function processApr(aprSDK: any) {
    const calc = (boost = '1') => {
      // const stakedBaseAPR = bnum(unstakedTotalAPR).plus(aprSDK.stakingApr);
      // const boostedAPR = stakingBalApr?.min
      //   ? bnum(stakingBalApr.min).times(boost)
      //   : bnum('0');

      return 'stakedBaseAPR.plus(boostedAPR).toString()';
    };
    const divider = 10000;
    return {
      swap: (aprSDK.swapFees / divider).toString(),
      yield: {
        total: (aprSDK.tokenAprs / divider).toString(),
        breakdown: {}
      },
      staking: {
        bal: {
          min: (aprSDK.stakingApr.min / divider).toString(),
          max: (aprSDK.stakingApr.max / divider).toString()
        },
        rewards: (aprSDK.rewardsApr / divider).toString()
      },
      total: {
        unstaked: '0.0160432637156567356545',
        staked: {
          calc,
          max: (aprSDK.max / divider).toString(),
          min: (aprSDK.min / divider).toString()
        }
      }
    };
  }

  const queryFn = async () => {
    if (!pool.value && !poolInfo) throw new Error('No pool');
    if (poolInfo?.apr) {
      console.log('apr pool info', poolInfo.apr);
      return poolInfo.apr;
    }

    try {
      const poolSDK = await balancer.pools.find(id);
      const aprSDK = await poolSDK?.apr();
      console.log('aprSDK', aprSDK);

      if (!aprSDK) throw new Error('No apr');

      return processApr(aprSDK);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<PoolAPRs>(queryKey, queryFn, queryOptions);
}
