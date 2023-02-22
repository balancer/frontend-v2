// <script lang="ts" setup>
// const title = 'SSR';
// TODO: script exporting title is causing export default error when running build
//
import Index from '@/pages/index.vue';
import { isWeb3PluginLoaded, provideWeb3Plugin } from '@/providers/web3-plugin.provider';
import { useWeb3Plugin } from '@/providers/web3-plugin.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';

import logoUrl from '@/assets/images/logo-light.svg';
import { initDependencies } from '@/dependencies';

onMounted(()=>  {
  initDependencies()
  const web3plugin = provideWeb3Plugin();
  isWeb3PluginLoaded.value = true;
  const userSettings = provideUserSettings();
  const tokenLists = provideTokenLists();
  provideTokens(userSettings, tokenLists, web3plugin);
})

</script>

<template>
  <p>
    This page is rendered on the <b>server-side</b>, then rendered
    <i>again</i> on the <b>client-side</b> during
    <a href="https://vite-plugin-ssr.com/hydration">hydration</a>. This
    technique is the default behavior for
    <InlineCode>vite-plugin-ssr</InlineCode>, commonly referred to as
    <a href="https://vite-plugin-ssr.com/render-modes#ssr"
      ><b>server-side rendering</b> (SSR)</a
    >.
    <Index v-if="isWeb3PluginLoaded"></Index>
  </p>

</template>
