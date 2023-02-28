<script setup>
/**
 *  This Root.vue component provides global providers that can be injected from any component
 *  We need this higher component over App.vue because App uses some composables (for instance, useWeb3Watchers) that expect a provided content from a higher level component (Root.vue)
 */
import App from './App.vue';
// import { provideWeb3Plugin } from './providers/web3-plugin.provider';

/**
 * GLOBAL PROVIDERS
 */
</script>

<template>
  <App />
</template>
