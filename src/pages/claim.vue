<script lang="ts" setup>
import { computed, watch } from 'vue';
import { configService } from '@/services/config/config.service';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import { Gauge } from '@/services/balancer/gauges/types';
import useTokens from '@/composables/useTokens';
import useSimplePoolsQuery from '@/composables/queries/useSimplePoolsQuery';
import { Pool } from '@/services/balancer/subgraph/types';
import { formatUnits } from 'ethers/lib/utils';
import useNumbers from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';
import { isStableLike } from '@/composables/usePool';
import { useTokenHelpers } from '@/composables/useTokenHelpers';

import { RewardRow } from '@/components/tables/BalClaimsTable/BalClaimsTable.vue';
import BalClaimsTable from '@/components/tables/BalClaimsTable/BalClaimsTable.vue';
import LegacyClaims from '@/components/contextual/pages/claim/LegacyClaims.vue';
import GaugeRewardsTable from '@/components/tables/GaugeRewardsTable/GaugeRewardsTable.vue';
import { bnum } from '@/lib/utils';

/**
 * COMPOSABLES
 */
const { injectTokens, getToken } = useTokens();
const { balToken } = useTokenHelpers();
const { toFiat, fNum2 } = useNumbers();

// Data fetching
const { data: subgraphGauges } = useGaugesQuery();
const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);
const gauges = computed((): Gauge[] => gaugesQuery.data.value || []);
const gaugePoolIds = computed((): string[] => {
  return gauges.value.map(gauge => gauge.poolId);
});
const poolsQuery = useSimplePoolsQuery(gaugePoolIds);
const pools = computed((): Pool[] => poolsQuery.data.value || []);

/**
 * TYPES
 */
type GaugeTable = {
  gauge: Gauge;
  pool: Pool;
};

/**
 * STATE
 */
const networks = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    subdomain: 'app',
    key: '1'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    subdomain: 'polygon',
    key: '137'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    subdomain: 'arbitrum',
    key: '42161'
  }
];

/**
 * COMPUTED
 */
const networkBtns = computed(() => {
  return networks.filter(network => network.key !== configService.network.key);
});

// Since the pool query is dependent on the gauge query, we only have to wait
// for the pool query to finish loading.
const poolQueryLoading = computed(
  (): boolean =>
    poolsQuery.isLoading.value ||
    poolsQuery.isIdle.value ||
    !!poolsQuery.error.value
);

const balRewardsData = computed((): RewardRow[] => {
  // Using reduce to filter out gauges we don't have corresponding pools for
  return gauges.value.reduce<RewardRow[]>((arr, gauge) => {
    const amount = formatUnits(gauge.claimableTokens, balToken.value.decimals);
    const pool = pools.value.find(pool => pool.id === gauge.poolId);

    if (pool && bnum(amount).gt(0))
      arr.push({
        gauge,
        pool,
        amount,
        value: toFiat(amount, balToken.value.address)
      });

    return arr;
  }, []);
});

const gaugesWithRewards = computed((): Gauge[] => {
  return gauges.value.filter(gauge => gauge.rewardTokens.length > 0);
});

const gaugeTables = computed((): GaugeTable[] => {
  return gaugesWithRewards.value.reduce<GaugeTable[]>((arr, gauge) => {
    const pool = pools.value.find(pool => pool.id === gauge.poolId);

    if (pool)
      arr.push({
        gauge,
        pool
      });

    return arr;
  }, []);
});

/**
 * METHODS
 */
async function injectRewardTokens(gauges: Gauge[]): Promise<void> {
  const allRewardTokens = gauges.map(gauge => gauge.rewardTokens).flat();
  return await injectTokens(allRewardTokens);
}

async function injectPoolTokens(pools: Pool[]): Promise<void> {
  const allPoolTokens = pools.map(pools => pools.tokensList).flat();
  return await injectTokens(allPoolTokens);
}

function gaugeTitle(pool: Pool): string {
  const _tokens = pool.tokens.map(token => ({
    ...token,
    ...getToken(getAddress(token.address))
  }));

  if (isStableLike(pool.poolType)) {
    return Object.values(_tokens)
      .map(token => token.symbol)
      .join(' / ');
  }

  return Object.values(_tokens)
    .map(
      token =>
        `${fNum2(token.weight, {
          style: 'percent',
          maximumFractionDigits: 0
        })} ${token.symbol}`
    )
    .join(' / ');
}

/**
 * WATCHERS
 */
watch(gauges, async newGauges => {
  console.log('newGauges', newGauges);
  if (newGauges) await injectRewardTokens(newGauges);
});

watch(pools, async newPools => {
  console.log('pools', newPools);
  if (newPools) await injectPoolTokens(newPools);
});
</script>

<template>
  <div class="px-2 lg:px-0">
    <div class="lg:container lg:mx-auto py-12">
      <h2 class="font-body font-bold text-2xl">
        {{ configService.network.chainName }} {{ $t('liquidityIncentives') }}
      </h2>

      <div class="flex items-center mt-6 mb-2">
        <BalAsset :iconURI="balToken?.logoURI" />
        <h3 class="text-xl ml-2">Balancer (BAL) earnings</h3>
      </div>
      <BalClaimsTable
        :rewardsData="balRewardsData"
        :isLoading="poolQueryLoading"
      />

      <template v-if="!poolQueryLoading && gaugesWithRewards.length > 0">
        <h3 class="text-xl mt-8">Other token earnings</h3>
        <div v-for="{ gauge, pool } in gaugeTables" :key="gauge.id">
          <div class="flex mt-4">
            <h4 class="text-base mb-2">
              {{ gaugeTitle(pool) }}
            </h4>
          </div>
          <GaugeRewardsTable :gauge="gauge" :isLoading="poolQueryLoading" />
        </div>
      </template>

      <h2 class="font-body font-bold text-2xl mt-8">
        {{ $t('pages.claim.titles.incentivesOnOtherNetworks') }}
      </h2>
      <div class="flex mt-4">
        <BalBtn
          tag="a"
          :href="`https://${network.subdomain}.balancer.fi/#/claims`"
          v-for="network in networkBtns"
          :key="network.id"
          color="white"
          class="mr-4"
        >
          <img
            :src="require(`@/assets/images/icons/networks/${network.id}.svg`)"
            alt="Arbitrum"
            class="w-6 h-6 rounded-full shadow-sm mr-2"
          />
          {{ $t('pages.claim.btns.claimOn') }} {{ network.name }}
        </BalBtn>
      </div>

      <h2 class="font-body font-bold text-2xl mt-8">
        {{ $t('pages.claim.titles.legacyIncentives') }}
      </h2>
      <LegacyClaims />
    </div>
  </div>
</template>
