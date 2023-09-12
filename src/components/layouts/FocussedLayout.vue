<script setup lang="ts">
import useAlerts from '@/composables/useAlerts';
import { useReturnRoute } from '@/composables/useReturnRoute';
import AppNavAlert from '@/components/navs/AppNav/AppNavAlert.vue';
import { isFakeModal } from '@/composables/useFakeModal';

const { getReturnRoute } = useReturnRoute();
const { currentAlert } = useAlerts();
</script>
<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <div class="pb-16">
    <div class="h-screen" :class="{ 'bg-gray-850': isFakeModal }">
      <div class="mb-12 layout-header">
        <div />
        <BalBtn tag="router-link" :to="getReturnRoute()" color="white" circle>
          <BalIcon name="x" size="lg" />
        </BalBtn>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}
</style>
