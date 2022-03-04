<script lang="ts" setup>
import { computed } from 'vue';
import StatCard from '@/components/cards/StatCard/StatCard.vue';
import { configService } from '@/services/config/config.service';

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

const networkBtns = computed(() => {
  return networks.filter(network => network.key !== configService.network.key);
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
