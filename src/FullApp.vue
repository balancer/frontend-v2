<script setup>
/**
 *  This Root.vue component provides global providers that can be injected from any component
 *  We need this higher component over App.vue because App uses some composables (for instance, useWeb3Watchers) that expect a provided content from a higher level component (Root.vue)
 */
import Skeleton from './Skeleton.vue';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';
import { provideUserData } from '@/providers/user-data.provider';
import { provideWallets } from './providers/wallet.provider';
import { createProviderComponent } from './providers/createProviderComponent';
import { initDependencies } from './dependencies';

initDependencies();

// The other providers call useWallets so we need to provide it in a higher level
const WalletsProvider = createProviderComponent(() => {
  console.log('providing wallets ');
  return provideWallets();
});
const GlobalProvider = createProviderComponent(() => {
  console.log('providing Global Provider');
  const userSettings = provideUserSettings();
  const tokenLists = provideTokenLists();
  provideTokens(userSettings, tokenLists);
  provideUserData();
});
</script>

<template>
  <WalletsProvider>
    <GlobalProvider>
      <Skeleton />
    </GlobalProvider>
  </WalletsProvider>
</template>
