<script setup lang="ts">
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';

// COMPOSABLES
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();
</script>

<template>
  <TokenSearchInput
    v-model="selectedTokens"
    @add="addSelectedToken"
    @remove="removeSelectedToken"
  />
</template>