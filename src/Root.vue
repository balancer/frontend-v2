<script setup>
/**
 *  This Root.vue component provides global providers that can be injected from any component
 *  We need this higher component over App.vue because App uses some composables (for instance, useWeb3Watchers) that expect a provided content from a higher level component (Root.vue)
 */
import App from './App.vue';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';

//
const userSettings = provideUserSettings();
const tokenLists = provideTokenLists();
provideTokens(userSettings, tokenLists);
</script>

<template>
  <App />
</template>