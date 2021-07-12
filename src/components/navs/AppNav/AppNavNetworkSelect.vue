<template>
  <BalPopover align="left" no-pad>
    <template v-slot:activator>
      <BalBtn
        color="gray"
        outline
        rounded
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
        class="ml-4"
      >
        <img
          :src="iconSrc(activeNetwork)"
          :alt="activeNetwork.name"
          class="w-5 h-5 rounded-full shadow-sm"
        />
        <span class="hidden lg:block ml-2">
          {{ activeNetwork.name }}
        </span>
      </BalBtn>
    </template>
    <div class="flex flex-col w-44 rounded-lg overflow-hidden">
      <div
        class="p-3 border-b dark:border-gray-900 whitespace-nowrap text-gray-500 font-medium"
      >
        Select a network
      </div>
      <a
        v-for="network in networks"
        :key="network.id"
        :href="appUrl(network)"
        class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850"
        @click="redirectTo(network)"
      >
        <div class="flex items-center">
          <img
            :src="iconSrc(network)"
            :alt="network.name"
            class="w-5 h-5 rounded-full mr-2"
          />
          <span class="ml-1 font-medium">
            {{ network.name }}
          </span>
        </div>
        <BalIcon v-if="isActive(network)" name="check" class="text-blue-500" />
      </a>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import ConfigService from '@/services/config/config.service';
import { defineComponent } from 'vue';

interface Network {
  id: string;
  name: string;
  subdomain: string;
  key: string;
}

export default defineComponent({
  name: 'AppNavNetworkSelect',

  setup() {
    // SERVICES
    const configService = new ConfigService();

    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();

    // DATA
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
      }
    ];

    const appNetworkSupported = networks
      .map(network => network.key)
      .includes(configService.network.key);

    const activeNetwork = networks.find(network => {
      if (!appNetworkSupported && network.id === 'ethereum') return true;
      return isActive(network);
    });

    // METHODS
    function iconSrc(network: Network): string {
      return require(`@/assets/images/icons/networks/${network.id}.svg`);
    }

    function appUrl(network: Network): string {
      return `https://${network.subdomain}.balancer.fi`;
    }

    function isActive(network: Network): boolean {
      if (!appNetworkSupported && network.id === 'ethereum') return true;
      return configService.network.key === network.key;
    }

    return {
      // computed
      upToLargeBreakpoint,
      // data
      networks,
      activeNetwork,
      // methods
      isActive,
      appUrl,
      iconSrc
    };
  }
});
</script>
