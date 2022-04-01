import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import { bnum, getBalAddress } from '@/lib/utils';
import { getBptPrice } from '@/lib/utils/balancer/pool';
import { GaugeController } from '@/services/balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '@/services/balancer/contracts/contracts/token-admin';
import { configService } from '@/services/config/config.service';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { isNil, mapValues } from 'lodash';
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

const MIN_BOOST = 1;
const MAX_BOOST = 2.5;

export default function useStakingRewards() {
  /** COMPOSABLES */
  const { priceFor } = useTokens();

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

  const { data: inflationRate, isLoading: isLoadingInflationRate } = useQuery(
    ['inflation_rate'],
    () => tokenAdmin.getInflationRate()
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

  const gaugeAprMap = computed(() => {
    if (
      isLoadingInflationRate.value ||
      isLoadingStakingData.value ||
      isLoadingRelativeWeight.value ||
      isLoadingGaugeWorkingSupplies.value
    )
      return {};
    const aprs = Object.keys(gaugePoolMap.value).map(gaugeAddress => {
      const poolId = gaugePoolMap.value[gaugeAddress];
      const pool = stakeablePools.value.find(pool => pool.id === poolId);
      if (!pool) return [poolId, '0'];
      if (isNil(inflationRate)) return [poolId, '0'];

      const bptPrice = getBptPrice(pool);
      const balAddress = getBalAddress();
      if (!balAddress) return [poolId, '0'];

      const balPrice = priceFor(getAddress(balAddress));
      const apr = calculateGaugeApr({
        gaugeAddress: gaugeAddress,
        bptPrice: bptPrice.toString(),
        balPrice: String(balPrice),
        // undefined inflation rate is guarded above
        inflationRate: inflationRate.value as string,
        boost: '1'
      });

      return [poolId, apr];
    });
    return Object.fromEntries(aprs);
  });

  /** METHODS */

  function calculateWeeklyReward(
    workingSupply: BigNumber,
    balPayableToGauge: BigNumber
  ) {
    const workingBalance = 0.4;
    const shareForOneBpt = bnum(workingBalance).div(
      workingSupply.plus(workingBalance)
    );
    const weeklyReward = shareForOneBpt.times(balPayableToGauge);
    return weeklyReward;
  }

  function calculateBalPayableToGauge(
    inflationRate: BigNumber,
    gaugeRelativeWeight: BigNumber
  ) {
    return bnum(inflationRate)
      .times(7)
      .times(86400)
      .times(gaugeRelativeWeight);
  }

  function calculateGaugeApr({
    gaugeAddress,
    inflationRate,
    balPrice,
    bptPrice,
    boost = '1'
  }: {
    gaugeAddress: string;
    inflationRate: string;
    balPrice: string;
    bptPrice: string;
    boost: string;
  }) {
    const workingSupply =
      bnum((gaugeWorkingSupplies.value || {})[gaugeAddress]) || '0';
    const relativeWeight =
      bnum((gaugeRelativeWeights.value || {})[gaugeAddress]) || '0';
    const balPayable = calculateBalPayableToGauge(
      bnum(inflationRate),
      relativeWeight
    );
    const weeklyReward = calculateWeeklyReward(workingSupply, balPayable);
    const yearlyReward = weeklyReward
      .times(boost)
      .times(52)
      .times(balPrice);

    const apr = yearlyReward.div(bptPrice);
    return apr;
  }

  function getAprRange(apr: string) {
    const min = bnum(apr).times(MIN_BOOST);
    const max = bnum(apr).times(MAX_BOOST);
    return {
      min,
      max
    };
  }

  return {
    gaugeAprMap,
    stakingData,
    getAprRange,
    calculateGaugeApr
  };
}
