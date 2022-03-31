import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { getBptPrice } from '@/lib/utils/balancer/pool';
import { GaugeController } from '@/services/balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '@/services/balancer/contracts/contracts/token-admin';
import { configService } from '@/services/config/config.service';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';
import { formatUnits } from 'ethers/lib/utils';
import { mapValues } from 'lodash';
import { computed, reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';

/**
 * CONTRACTS
 */
const tokenAdmin = new BalancerTokenAdmin(
  configService.network.addresses.tokenAdmin
);
const controller = new GaugeController(
  configService.network.addresses.gaugeController
);

type TLiquidityGauge = {
  id: string;
  poolId: string;
};

type StakingDataResponse = {
  liquidityGauges: TLiquidityGauge[];
};

export default function useStakingRewards() {
  const { data: stakingData, isLoading: isLoadingStakingData } = useGraphQuery<
    StakingDataResponse
  >(subgraphs.gauge, ['staking', 'data', {}], () => ({
    liquidityGauges: {
      __args: {
        where: {
          poolId_in: POOLS.Stakeable.AllowList
        }
      },
      poolId: true,
      id: true
    }
  }));

  // map of <gauge address> - <pool id>
  const gaugePoolMap = computed(() => {
    const stakedGaugesMap = Object.fromEntries(
      (stakingData.value?.liquidityGauges || []).map(gauge => [
        gauge.id,
        gauge.poolId
      ])
    );
    return stakedGaugesMap;
  });

  const { data: stakeablePoolsResponse } = usePoolsQuery(
    ref([]),
    {},
    { poolIds: ref(POOLS.Stakeable.AllowList) }
  );

  const stakeablePools = computed(
    () => stakeablePoolsResponse.value?.pages[0].pools || []
  );

  const {
    data: gaugeWorkingSupplies,
    isLoading: isLoadingGaugeWorkingSupplies
  } = useQuery(
    reactive(['pools', 'gauge_working_supply', { gaugePoolMap }]),
    async () => {
      const multicaller = LiquidityGauge.getMulticaller();
      for (const gaugeAddress of Object.keys(gaugePoolMap.value)) {
        multicaller.call(gaugeAddress, gaugeAddress, 'working_supply');
      }
      const result = await multicaller.execute();
      const supplies = mapValues(result, weight => formatUnits(weight, 18));
      return supplies;
    }
  );

  const {
    data: gaugeRelativeWeights,
    isLoading: isLoadingRelativeWeight
  } = useQuery(
    reactive(['pools', 'gauge_relative_weight', { gaugePoolMap }]),
    async () => {
      const timestamp = getUnixTime(new Date());
      const result = await controller.getRelativeWeights(
        Object.keys(gaugePoolMap.value),
        timestamp
      );
      return result;
    }
  );

  const weeklyRewards = computed(() => {
    const workingBalance = 0.4;
    console.log('working supplies are', gaugeWorkingSupplies.value);
    const rewards = mapValues(
      gaugeWorkingSupplies.value,
      (supply, gaugeAddress) => {
        const shareForOneBpt = bnum(workingBalance).div(
          bnum(bnum(supply).plus(workingBalance))
        );
        const weeklyReward = shareForOneBpt.times(
          balPayableMap.value[gaugeAddress]
        );
        return weeklyReward;
      }
    );
    return rewards;
  });

  const { data: inflationRate, isLoading: isLoadingInflationRate } = useQuery(
    ['inflation_rate'],
    () => tokenAdmin.getInflationRate()
  );

  // a map of <gaugeid>-<bal payable to gauge>
  // for a week
  const balPayableMap = computed(() => {
    const payouts: Record<string, BigNumber> = {};
    const rate = inflationRate.value ?? '0';
    console.log('inflation rate is', inflationRate.value);
    const relativeWeights = gaugeRelativeWeights.value || {};
    console.log('relative weights are', relativeWeights);
    for (const gaugeAddress of Object.keys(gaugePoolMap.value)) {
      const relativeWeight = relativeWeights[gaugeAddress] || '0';
      payouts[gaugeAddress] = bnum(rate)
        .times(7)
        .times(86400)
        .times(bnum(relativeWeight));
    }
    console.log(
      'payouts',
      mapValues(payouts, payout => payout.toString())
    );
    return payouts;
  });

  const gaugeAprMap = computed(() => {
    console.log(
      'weekly rewards are',
      mapValues(weeklyRewards.value, reward => reward.toString())
    );
    const aprs = mapValues(
      weeklyRewards.value,
      (weeklyReward, gaugeAddress) => {
        const poolId = gaugePoolMap.value[gaugeAddress];
        const pool = stakeablePools.value.find(pool => pool.id === poolId);
        const bptPrice = getBptPrice(pool);
        console.log('week', {
          weeklyReward: weeklyReward.toString(),
          bptPrice: bptPrice.toString()
        })
        return bnum(weeklyReward)
          .times(1)
          .times(52)
          .times(16.48)
          .div(bptPrice);
      }
    );
    console.log('aprs', mapValues(aprs, apr => apr.toString()));
    return aprs;
  });
  return {
    gaugeAprMap,
    stakingData
  };
}
