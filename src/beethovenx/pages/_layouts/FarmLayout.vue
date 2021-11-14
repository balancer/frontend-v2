<script setup lang="ts">
import { ref } from 'vue';
// Composables
import useBreakpoints from '@/composables/useBreakpoints';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { useRoute } from 'vue-router';
// Components
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';

/**
 * STATE
 */
const route = useRoute();
const id = ref<string>(route.params.id as string);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const {
  pool,
  loadingPool,
  useNativeAsset,
  transfersAllowed
} = usePoolTransfers();
usePoolTransfersGuard();
</script>

<template>
  <div class="pb-16">
    <div class="layout-header mb-12">
      <div></div>
      <router-link :to="{ name: 'pool', params: { id } }">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>

    <Col3Layout offsetGutters mobileHideGutters>
      <template #gutterLeft v-if="!upToLargeBreakpoint">
        <div />
      </template>

      <router-view :key="$route.path" />

      <template #gutterRight v-if="!upToLargeBreakpoint">
        <div />
      </template>
    </Col3Layout>
  </div>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}
</style>
