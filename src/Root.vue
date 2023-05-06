<script lang="ts" setup>
/**
 *  This Root.vue component provides global providers that can be injected from any component
 *  We need this higher component over App.vue because App uses some composables (for instance, useWeb3Watchers) that expect a provided content from a higher level component (Root.vue)
 */
import Skeleton from './Skeleton.vue';
import SdkLoader from './SdkLoader';

import { useContentLoadStates } from '@/composables/useContentLoadStates';

const WalletsProvider = defineAsyncComponent(() => import('./WalletsProvider'));
const GlobalProvider = defineAsyncComponent(() => import('./GlobalProvider'));
const { isFirstContentPainted, isGlobalProviderLoaded } =
  useContentLoadStates();
</script>

<template>
  <SdkLoader />

  <WalletsProvider v-if="isFirstContentPainted">
    <GlobalProvider>
      <Skeleton v-if="isGlobalProviderLoaded"></Skeleton>
    </GlobalProvider>
  </WalletsProvider>

  <Skeleton v-if="!isFirstContentPainted || !isGlobalProviderLoaded"></Skeleton>
</template>
