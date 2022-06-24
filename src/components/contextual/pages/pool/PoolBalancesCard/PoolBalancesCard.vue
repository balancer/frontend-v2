<script setup lang="ts">
import { Pool } from '@/services/pool/types';

import BoostedPool from './BoostedPool.vue';
import DefaultPool from './DefaultPool.vue';

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
withDefaults(defineProps<Props>(), {
  loading: false
});
</script>

<template>
  <BalLoadingBlock v-if="loading" class="h-64" />
  <template v-else>
    <BoostedPool
      v-if="pool?.onchain?.linearPools"
      :pool="pool"
      :loading="loading"
    />
    <DefaultPool v-else :pool="pool" />
  </template>
</template>
