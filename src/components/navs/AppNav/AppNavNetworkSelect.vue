<script setup lang="ts">
import { computed, ref } from 'vue';

import useBreakpoints from '@/composables/useBreakpoints';
import ConfigService from '@/services/config/config.service';

export interface NetworkOption {
  id: string;
  name: string;
  subdomain?: string;
  key?: string;
}

// SERVICES
const configService = new ConfigService();

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();

const networks = ref([
  {
    id: 'ethereum',
    name: 'Ethereum',
    subdomain: 'app',
    key: '1',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    subdomain: 'polygon',
    key: '137',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    subdomain: 'arbitrum',
    key: '42161',
  },
]);

const appNetworkSupported = networks.value
  .map(network => network.key)
  .includes(configService.network.key);

const activeNetwork = computed(() =>
  networks.value.find(network => {
    if (!appNetworkSupported && network.id === 'ethereum') return true;
    return isActive(network);
  })
);

// METHODS
function iconSrc(network: NetworkOption): string {
  return require(`@/assets/images/icons/networks/${network.id}.svg`);
}

function appUrl(network: NetworkOption): string {
  return `https://${network.subdomain}.balancer.fi`;
}

function isActive(network: NetworkOption): boolean {
  if (!appNetworkSupported && network.id === 'ethereum') return true;
  return configService.network.key === network.key;
}
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <BalBtn color="white" :size="upToLargeBreakpoint ? 'md' : 'sm'">
        <template v-if="activeNetwork">
          <img
            :src="iconSrc(activeNetwork)"
            :alt="activeNetwork.name"
            class="w-6 h-6 rounded-full"
          />
          <span class="ml-2">
            {{ activeNetwork.name }}
          </span>
          <BalIcon name="chevron-down" size="sm" class="ml-2" />
        </template>
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col w-44 rounded-lg">
      <div
        class="py-2 px-3 text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
      >
        {{ $t('networkSelection') }}:
      </div>
      <a
        v-for="network in networks"
        :key="network.id"
        :href="appUrl(network)"
        class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <div class="flex items-center">
          <img
            :src="iconSrc(network)"
            :alt="network.name"
            class="mr-2 w-6 h-6 rounded-full"
          />
          <span class="ml-1 font-medium">
            {{ network.name }}
          </span>
        </div>
        <BalIcon
          v-if="isActive(network)"
          name="check"
          class="text-blue-500 dark:text-blue-400"
        />
      </a>
    </div>
  </BalPopover>
</template>


