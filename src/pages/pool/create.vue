<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChooseWeights from '@/components/cards/CreatePool/ChooseWeights.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * STATE
 */

/**
 * QUERIES
 */

/**
 * COMPUTED
 */
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-x-8 pt-8">
    <div class="col-span-6 col-start-4">
      <ChooseWeights />
    </div>
  </div>
</template>

<style scoped></style>
