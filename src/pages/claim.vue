<script lang="ts" setup>
import { computed, onBeforeMount, watch } from 'vue';
import StatCard from '@/components/cards/StatCard/StatCard.vue';
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

/**
 * COMPOSABLES
 */
const { injectTokens, getTokens, getToken } = useTokens();

const { data: subgraphGauges } = useGaugesQuery();
const gauges = useGaugesDecorationQuery(subgraphGauges);

const gaugePoolAddresses = computed(() => {
  if (!gauges.data.value) return [];
  return gauges.data.value.map(gauge => gauge.poolId);
});

const pools = useSimplePoolsQuery(gaugePoolAddresses);

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
    gauges.isLoading.value || gauges.isIdle.value || !!gauges.error.value
);

const poolQueryLoading = computed(
  (): boolean =>
    pools.isLoading.value || pools.isIdle.value || !!pools.error.value
);

const rewardTokens = computed(
  (): TokenInfoMap => {
    if (!gauges.data.value) return {};

    const addresses = uniq(
      gauges.data.value.map(gauge => gauge.rewardTokens).flat()
    );
    return getTokens(addresses);
  }
);

const balToken = computed(
  (): TokenInfo => getToken(TOKENS.AddressMap[networkId.value.toString()].BAL)
);

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

/**
 * WATCHERS
 */
watch(gauges.data, async newGauges => {
  console.log('newGauges', newGauges);
  if (newGauges) await injectRewardTokens(newGauges);
});

watch(pools.data, async newPools => {
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
        <h3 class="text-xl ml-2">Balancer (BAL) earnings</h3>
      </div>

      <div v-for="token in rewardTokens" :key="token.address">
        <div class="flex mt-4">
          <BalAsset :iconURI="token?.logoURI" />
          <h3 class="text-xl ml-2">
            {{ token?.name }} ({{ token?.symbol }}) earnings
          </h3>
        </div>
      </div>

      <h2 class="font-body font-bold text-2xl">
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
