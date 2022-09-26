<script setup lang="ts">
import { toRef } from 'vue';

import { usePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

import InvestmentTransactions from './InvestmentTransactions/InvestmentTransactions.vue';
import TradeTransactions from './TradeTransactions/TradeTransactions.vue';

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
const { isComposableStableLikePool } = usePool(toRef(props, 'pool'));
</script>

<template>
  <InvestmentTransactions :pool="pool" :loading="loading" />

  <TradeTransactions
    v-if="!isComposableStableLikePool"
    :pool="pool"
    :loading="loading"
  />
</template>
