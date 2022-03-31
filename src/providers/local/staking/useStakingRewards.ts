import { bnum } from '@/lib/utils';
import { getBptPrice } from '@/lib/utils/balancer/pool';
import { GaugeController } from '@/services/balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '@/services/balancer/contracts/contracts/token-admin';
import { configService } from '@/services/config/config.service';
import { getUnixTime } from 'date-fns';
import { formatUnits } from 'ethers/lib/utils';
import { mapValues } from 'lodash';
import { computed, reactive } from 'vue';
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

export default function useStakingRewards() {
  const userGaugeAddressToPoolIdMap = computed(() => {
    const stakedGaugesMap = Object.fromEntries(
      (stakingData.value?.gaugeShares || []).map(gaugeShare => [
        gaugeShare.gauge.id,
        gaugeShare.gauge.poolId
      ])
    );
    const userGaugesMap = Object.fromEntries(
      (stakingData.value?.liquidityGauges || [])
        .filter(gauge => gauge.id !== undefined)
        .map(gauge => [gauge.id, gauge.poolId])
    );
    return {
      ...stakedGaugesMap,
      ...userGaugesMap
    };
  });

  const {
    data: gaugeWorkingSupplies,
    isLoading: isLoadingGaugeWorkingSupplies
  } = useQuery(
    reactive([
      'pools',
      'gauge_working_supply',
      { userGaugeAddressToPoolIdMap }
    ]),
    async () => {
      const multicaller = LiquidityGauge.getMulticaller();
      for (const gaugeAddress of Object.keys(
        userGaugeAddressToPoolIdMap.value
      )) {
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
    reactive([
      'pools',
      'gauge_relative_weight',
      { poolAddress, userGaugeAddressToPoolIdMap }
    ]),
    async () => {
      const timestamp = getUnixTime(new Date());
      const result = await controller.getRelativeWeights(
        Object.keys(userGaugeAddressToPoolIdMap.value),
        timestamp
      );
      return result;
    }
  );

  const weeklyRewards = computed(() => {
    const balanceFactor = 0.4;
    const rewards = mapValues(
      gaugeWorkingSupplies.value,
      (supply, gaugeAddress) =>
        bnum(balanceFactor).div(
          bnum(bnum(supply).plus(balanceFactor)).times(
            balPayableMap.value[gaugeAddress]
          )
        )
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
    const payouts = {};
    const rate = inflationRate.value ?? '0';
    const relativeWeights = gaugeRelativeWeights.value || {};
    for (const gaugeAddress of Object.keys(userGaugeAddressToPoolIdMap.value)) {
      const relativeWeight = relativeWeights[gaugeAddress] || '0';
      payouts[gaugeAddress] = bnum(rate)
        .times(7)
        .times(86400)
        .times(bnum(relativeWeight));
    }
    return payouts;
  });

  const gaugeAprMap = computed(() => {
    const aprs = mapValues(
      weeklyRewards.value,
      (weeklyReward, gaugeAddress) => {
        const poolId = userGaugeAddressToPoolIdMap.value[gaugeAddress];
        const pool = stakedPools.value.find(pool => pool.id === poolId);
        const bptPrice = getBptPrice(pool);
        return bnum(weeklyReward)
          .times(1)
          .times(52)
          .times(20)
          .div(bptPrice);
      }
    );
    return aprs;
  });
}
