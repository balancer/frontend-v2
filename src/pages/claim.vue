<script lang="ts" setup>
import { computed, watch } from 'vue';
import { configService } from '@/services/config/config.service';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import { Gauge } from '@/services/balancer/gauges/types';
import useTokens from '@/composables/useTokens';
import useSimplePoolsQuery from '@/composables/queries/useSimplePoolsQuery';
import { Pool } from '@/services/balancer/subgraph/types';
import { uniq } from 'lodash';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { TOKENS } from '@/constants/tokens';
import { networkId } from '@/composables/useNetwork';
import { formatUnits } from 'ethers/lib/utils';
import useNumbers from '@/composables/useNumbers';

import { RewardRow } from '@/components/tables/TokenClaimsTable/TokenClaimsTable.vue';
import StatCard from '@/components/cards/StatCard/StatCard.vue';
import TokenClaimsTable from '@/components/tables/TokenClaimsTable/TokenClaimsTable.vue';

/**
 * COMPOSABLES
 */
const { injectTokens, getTokens, getToken } = useTokens();
const { toFiat } = useNumbers();

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
 * CONSTANTS
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

const gaugeQueryLoading = computed(
  (): boolean =>
    gaugesQuery.isLoading.value ||
    gaugesQuery.isIdle.value ||
    !!gaugesQuery.error.value
);

const poolQueryLoading = computed(
  (): boolean =>
    poolsQuery.isLoading.value ||
    poolsQuery.isIdle.value ||
    !!poolsQuery.error.value
);

const rewardTokens = computed(
  (): TokenInfoMap => {
    const addresses = uniq(
      gauges.value.map(gauge => gauge.rewardTokens).flat()
    );
    return getTokens(addresses);
  }
);

const balToken = computed(
  (): TokenInfo => getToken(TOKENS.AddressMap[networkId.value.toString()].BAL)
);

const balRewardsData = computed((): RewardRow[] => {
  // Using reduce to filter out gauges we don't have corresponding pools for
  return gauges.value.reduce<RewardRow[]>((arr, gauge) => {
    const amount = formatUnits(gauge.claimableTokens, balToken.value.decimals);
    const pool = pools.value.find(pool => pool.id === gauge.poolId);

    if (pool)
      arr.push({
        pool,
        amount,
        value: toFiat(amount, balToken.value.address)
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

function rewardDataFor(token: TokenInfo): RewardRow[] {
  const relevantGauges = gauges.value.filter(gauge =>
    gauge.rewardTokens.includes(token.address)
  );

  // Using reduce to filter out gauges we don't have corresponding pools for
  return relevantGauges.reduce<RewardRow[]>((arr, gauge) => {
    const amount = formatUnits(
      gauge.claimableRewards[token.address],
      token.decimals
    );
    const pool = pools.value.find(pool => pool.id === gauge.poolId);

    if (pool)
      arr.push({
        pool,
        amount,
        value: toFiat(amount, balToken.value.address)
      });

    return arr;
  }, []);
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
  <div class="lg:container lg:mx-auto py-12">
    <div class="grid gap-24 grid-cols-2 grid-rows-1">
      <div class="">
        <h1 class="font-body font-bold text-4xl">
          {{ $t('pages.claim.title') }}
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          {{ $t('pages.claim.description') }}
        </p>
        <BalBtn outline class="mt-4">
          {{ $t('learnMore') }}
          <BalIcon name="arrow-up-right" class="ml-2" />
        </BalBtn>
      </div>
      <div class="grid gap-4 grid-cols-2 grid-rows-2">
        <StatCard label="My claimable incentives" value="-" />
        <StatCard label="My 30d yield" value="-" />
        <StatCard label="My 24h yield" value="-" />
        <StatCard label="My 24h APR" value="-" />
      </div>
    </div>
  </div>
  <div class="bg-gray-50">
    <div class="lg:container lg:mx-auto py-12">
      <h2 class="font-body font-bold text-2xl">
        {{ configService.network.chainName }} {{ $t('liquidityIncentives') }}
      </h2>

      <div class="flex mt-4">
        <BalAsset :iconURI="balToken?.logoURI" />
        <h3 class="text-xl ml-2 mb-2">Balancer (BAL) earnings</h3>
      </div>
      <TokenClaimsTable
        :rewardsData="balRewardsData"
        :isLoading="poolQueryLoading"
      />

      <div v-for="token in rewardTokens" :key="token.address" class="mt-8">
        <div class="flex mt-4">
          <BalAsset :iconURI="token?.logoURI" />
          <h3 class="text-xl ml-2 mb-2">
            {{ token?.name }} ({{ token?.symbol }}) earnings
          </h3>
        </div>
        <TokenClaimsTable
          :rewardsData="rewardDataFor(token)"
          :isLoading="poolQueryLoading"
        />
      </div>

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
    </div>
  </div>
</template>
