<template>
  <BalPopover noPad>
    <template #activator>
      <BalBtn color="white" :size="upToLargeBreakpoint ? 'md' : 'sm'">
        <img
          :src="iconSrc(activeNetwork)"
          :alt="activeNetwork.name"
          class="w-6 h-6 rounded-full"
        />
        <span class="ml-2">
          {{ activeNetwork.name }}
        </span>
        <BalIcon name="chevron-down" size="sm" class="ml-2" />
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col w-44 rounded-lg">
      <div
        class="py-2 px-3 text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
      >
        {{ $t('networkSelection') }}:
      </div>
      <div
        v-for="network in networks"
        :key="network.id"
        class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        @click="setActiveNetwork(network.key)"
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
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';

export interface NetworkOption {
  id: string;
  name: string;
  subdomain?: string;
  key?: string;
}

export default defineComponent({
  name: 'AppNavNetworkSelect',

  setup() {
    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();
    const { setNetworkId, networkId: activeNetworkId } = useNetwork();

    // DATA
    const networks = [
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
    ];

    // COMPUTED
    const appNetworkSupported = computed((): boolean => {
      return networks
        .map(network => network.key)
        .includes(activeNetworkId.value.toString());
    });

    const activeNetwork = computed((): NetworkOption | undefined => {
      return networks.find(network => {
        if (!appNetworkSupported.value && network.id === 'ethereum')
          return true;
        return isActive(network);
      });
    });

    // METHODS
    function iconSrc(network: NetworkOption): string {
      return require(`@/assets/images/icons/networks/${network.id}.svg`);
    }

    function appUrl(network: NetworkOption): string {
      return `https://${network.subdomain}.balancer.fi`;
    }

    function isActive(network: NetworkOption): boolean {
      if (!appNetworkSupported.value && network.id === 'ethereum') return true;
      return activeNetworkId.value.toString() === network.key;
    }

    function setActiveNetwork(network: Network) {
      setNetworkId(network);
      location.reload();
    }

    return {
      // composables
      activeNetworkId,
      // computed
      upToLargeBreakpoint,
      // data
      networks,
      activeNetwork,
      // methods
      setActiveNetwork,
      isActive,
      appUrl,
      iconSrc,
    };
  },
});
</script>
