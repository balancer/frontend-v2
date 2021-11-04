<script setup lang="ts">
import useSimulation from '@/composables/useSimulation';

/**
 * COMPOSABLES
 */
const { isSimulation, createSimulation } = useSimulation();

/**
 * METHODS
 */
function toggleSimulation(newVal: boolean): void {
  if (newVal) {
    createSimulation();
  }
}
</script>

<template>
  <BalToggle
    name="simulation"
    v-model="isSimulation"
    @update:modelValue="toggleSimulation"
  />
</template>
