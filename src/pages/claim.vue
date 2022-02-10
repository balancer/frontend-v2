<script lang="ts" setup>
import { computed } from 'vue';
import StatCard from '@/components/cards/StatCard/StatCard.vue';
import { configService } from '@/services/config/config.service';
import useDarkMode from '@/composables/useDarkMode';

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
 * COMPOSABLES
 */
const { darkMode } = useDarkMode();

/**
 * COMPUTED
 */
const networkBtns = computed(() => {
  return networks.filter(network => network.key !== configService.network.key);
});
</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <div class="lg:container lg:mx-auto py-12">
      <div class="grid gap-24 grid-cols-2 grid-rows-1">
        <div class="">
          <h1 class="font-body font-bold text-4xl">
            Claim all of your liquidity incentives
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mt-2">
            The Balancer protocol provides incentives to attract liquidity in
            eligible pools.
          </p>
          <BalBtn outline class="mt-4" :color="darkMode ? 'white' : 'primary'">
            Learn more
            <BalIcon name="arrow-up-right" class="ml-2" />
          </BalBtn>
        </div>
        <div class="grid gap-4 grid-cols-2 grid-rows-2">
          <StatCard label="My claimable incentives" value="$10,400.00" />
          <StatCard label="My 30d yield" value="$480.56" />
          <StatCard label="My 24h yield" value="$12.6845" />
          <StatCard label="My 24h APR" value="12.46%" />
        </div>
      </div>
    </div>
  </div>

  <div class="lg:container lg:mx-auto py-12">
    <h2 class="font-body font-bold text-2xl">
      {{ configService.network.chainName }} liquidity incentives
    </h2>

    <h2 class="font-body font-bold text-2xl">
      Incentives on other networks
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
        Claim on {{ network.name }}
      </BalBtn>
    </div>
  </div>
</template>
