<script lang="ts">
// REVIEW: script exporting title is causing export default error when running build
export const title = 'SSR';
</script>

<script lang="ts" setup>
import Index from '@/pages/index.vue';
import { useClientLogic } from '@pages/_default/useClientLogic';

// TODO: avoid this call and reuse isWeb3PluginLoaded from Layout.vue
const { isWeb3PluginLoaded } = useClientLogic();
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
