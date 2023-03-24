<script setup lang="ts">
import { toRef } from 'vue';

import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';

import InvestmentTransactions from './InvestmentTransactions/InvestmentTransactions.vue';
import SwapTransactions from './SwapTransactions/SwapTransactions.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * COMPOSABLES
 */
const { isDeepPool, isStablePhantomPool } = usePoolHelpers(
  toRef(props, 'pool')
);
</script>

<template>
  <InvestmentTransactions :pool="pool" :loading="loading" />

  <SwapTransactions
    v-if="!isStablePhantomPool && !isDeepPool"
    :pool="pool"
    :loading="loading"
  />
</template>
