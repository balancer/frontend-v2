import { QueryObserverOptions } from 'react-query/core';
import { reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { balancer } from '@/lib/balancer.sdk';
import { bnSum, bnum } from '@/lib/utils';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { PoolAPRs } from '@/services/pool/types';

import useNetwork from '../useNetwork';

/**
 * HELPERS
 */
export default function usePoolAprQuery(
  id: string,
  options: QueryObserverOptions<PoolAPRs> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const poolInfo = poolsStoreService.findPool(id);

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.APR(networkId, id);

  /**
   * METHODS
   */
  function processNum(num: number): string {
    return (num / 10000).toString();
  }

  function processApr(aprSDK: any) {
    const swapFeeAPR = processNum(aprSDK.swapFees);
    const yieldAPR = processNum(aprSDK.tokenAprs);

    const unstakedTotalAPR = bnSum([swapFeeAPR, yieldAPR]).toString();
    const stakingRewardApr = processNum(aprSDK.rewardsApr);
    const stakingBalApr = {
      min: processNum(aprSDK.stakingApr.min),
      max: processNum(aprSDK.stakingApr.max)
    };

    const calc = (boost = '1') => {
      const stakedBaseAPR = bnum(unstakedTotalAPR).plus(stakingRewardApr);
      const boostedAPR = stakingBalApr?.min
        ? bnum(stakingBalApr.min).times(boost)
        : bnum('0');

      return stakedBaseAPR.plus(boostedAPR).toString();
    };

    return {
      swap: processNum(aprSDK.swapFees),
      yield: {
        total: processNum(aprSDK.tokenAprs),
        breakdown: {}
      },
      staking: {
        bal: stakingBalApr,
        rewards: stakingRewardApr
      },
      total: {
        unstaked: unstakedTotalAPR,
        staked: {
          calc,
          max: processNum(aprSDK.max),
          min: processNum(aprSDK.min)
        }
      }
    };
  }

  const queryFn = async () => {
    if (poolInfo?.apr) {
      return poolInfo.apr;
    }

    try {
      console.time('balancer.pools.find');
      const poolSDK = await balancer.pools.find(id);
      console.timeEnd('balancer.pools.find');
      console.time('balancer.pools.apr');
      const aprSDK = await poolSDK?.apr();
      console.timeEnd('balancer.pools.apr');

      if (!aprSDK) throw new Error('No apr');

      return processApr(aprSDK);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<PoolAPRs>(queryKey, queryFn, queryOptions);
}
