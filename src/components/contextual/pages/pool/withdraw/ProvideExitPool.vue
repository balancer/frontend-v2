<script setup lang="ts">
import { computed } from 'vue';
import { provideExitPool } from '@/providers/local/exit-pool.provider';
import { Pool } from '@balancer-labs/sdk';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const pool = computed(() => props.pool);

provideExitPool(pool);
</script>

<template>
  <slot></slot>
</template>
