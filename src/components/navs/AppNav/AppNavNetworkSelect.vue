<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import useNotifications from '@/composables/useNotifications';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import config from '@/lib/config';
import { Config } from '@/lib/config/types';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { hardRedirectTo } from '@/plugins/router/nav-guards';

export interface NetworkOption {
  id: string;
  name: string;
  networkSlug?: string;
  key?: string;
}

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();
const { networkId, networkConfig } = useNetwork();
const { chainId } = useWeb3();
const router = useRouter();
const { addNotification } = useNotifications();
const { t } = useI18n();

function convertConfigToNetworkOption(config: Config): NetworkOption {
  return {
    id: config.slug,
    name: config.chainName,
    networkSlug: config.slug,
    key: config.key,
  };
}

const prodNetworks: NetworkOption[] = Object.values(config)
  .filter(config => config.visibleInUI && !config.testNetwork)
  .map(convertConfigToNetworkOption);

const networks = ref(prodNetworks);

const testNetworks: NetworkOption[] = Object.values(config)
  .filter(config => config.visibleInUI && config.testNetwork)
  .map(convertConfigToNetworkOption);

const networksDev = ref(testNetworks);

// COMPUTED
const allNetworks = computed(() => {
  return networks.value.concat(
    configService.env.APP_ENV === 'development' ||
      configService.env.APP_ENV === 'staging'
      ? networksDev.value
      : []
  );
});

const appNetworkSupported = computed((): boolean => {
  return allNetworks.value
    .map(network => network.key)
    .includes(networkId.value.toString());
});

const activeNetwork = computed((): NetworkOption | undefined =>
  allNetworks.value.find(network => {
    if (!appNetworkSupported.value && network.id === 'ethereum') return true;
    return isActive(network);
  })
);

// LIFECYCLE
onMounted(async () => {
  await router.isReady();
  if (router.currentRoute.value.query?.poolNetworkAlert) {
    addNotification({
      type: 'error',
      title: '',
      message: `${t('poolDoesntExist')} ${networkConfig.chainName}`,
    });
    router.replace({ query: {} });
  }
});

// WATCHERS
watch(chainId, (newChainId, oldChainId) => {
  if (
    newChainId &&
    oldChainId &&
    oldChainId !== newChainId &&
    networkId.value !== newChainId
  ) {
    const newNetwork = allNetworks.value.find(
      n => Number(n.key) === newChainId
    );
    if (newNetwork) {
      localStorage.setItem('networkId', newChainId.toString());
      hardRedirectTo(getNetworkChangeUrl(newNetwork));
    }
  }
});

// METHODS
function getNetworkChangeUrl(network: NetworkOption): string {
  const routes = [
    'pool',
    'create-pool',
    'add-liquidity',
    'withdraw',
    'migrate-pool',
  ];
  if (routes.includes(router.currentRoute.value.name?.toString() ?? '')) {
    return `/#/${network.networkSlug}?poolNetworkAlert=true`;
  }

  const currentRoute = router.currentRoute.value;
  return router.resolve({
    name: currentRoute.name ?? 'home',
    params: { ...currentRoute.params, networkSlug: network.networkSlug },
    query: currentRoute.query,
  }).href;
}

function isActive(network: NetworkOption): boolean {
  if (!appNetworkSupported.value && network.id === 'ethereum') return true;
  return networkId.value.toString() === network.key;
}
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <BalBtn color="white" :size="upToLargeBreakpoint ? 'md' : 'sm'">
        <template v-if="activeNetwork">
          <img
            :src="buildNetworkIconURL(activeNetwork.id)"
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
    <div role="menu" class="flex overflow-hidden flex-col w-56 rounded-lg">
      <div
        class="py-2 px-3 text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
      >
        {{ $t('networkSelection') }}:
      </div>
      <a
        v-for="network in allNetworks"
        :key="network.id"
        :href="getNetworkChangeUrl(network)"
        class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <div class="flex items-center">
          <img
            :src="buildNetworkIconURL(network.id)"
            :alt="network.name"
            class="mr-2 w-6 h-6 rounded-full"
          />
          <span class="ml-1 font-medium">
            {{ network.name }}
          </span>

          <!-- Save for new networks in future -->
          <span
            v-if="false"
            class="py-0.5 px-1 ml-1.5 text-xs font-medium dark:text-black uppercase bg-yellow-500 rounded"
            >{{ $t('new') }}
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
