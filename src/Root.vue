<script lang="ts" setup>
/**
 *  This Root.vue component provides global providers that can be injected from any component
 *  We need this higher component over App.vue because App uses some composables (for instance, useWeb3Watchers) that expect a provided content from a higher level component (Root.vue)
 */
import Skeleton from './Skeleton.vue';
import { useFirstContentLoad } from '@/composables/useFirstContentLoad';
import { createProviderComponent } from './providers/createProviderComponent';

// const FullApp = defineAsyncComponent(() => import('./FullApp.vue'));
const WalletsProvider = defineAsyncComponent(() => import('./WalletsProvider'));
const GlobalProvider = defineAsyncComponent(() => import('./GlobalProvider'));
const { isFirstContentPainted, isWeb3Loaded } = useFirstContentLoad();

function buildWalletsProvider(emptyProvider: boolean) {
  if (emptyProvider) return createProviderComponent();
  return WalletsProvider;
}

function buildGlobalProvider(emptyProvider: boolean) {
  if (emptyProvider) return createProviderComponent();
  return GlobalProvider;
}
</script>

<template>
  isFirstContentPainted {{ isFirstContentPainted }}
  <component :is="buildWalletsProvider(!isFirstContentPainted)">
    <component :is="buildGlobalProvider(!isFirstContentPainted)">
      <Skeleton></Skeleton>
      <!-- <div v-else>PROVIDED WALLET PROVIDER</div> -->
    </component>
  </component>
  <!-- <FullApp v-else /> -->
</template>
