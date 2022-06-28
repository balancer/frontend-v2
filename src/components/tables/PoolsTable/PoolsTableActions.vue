<script setup lang="ts">
import { computed } from 'vue';

import { isVeBalPool } from '@/composables/usePool';
import { POOLS } from '@/constants/pools';
import { PoolWithShares } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: PoolWithShares;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (e: 'click:stake', value: PoolWithShares): void;
}>();

/**
 * COMPOSABLES
 */

/** COMPUTED */
const stakablePoolIds = computed((): string[] => POOLS.Stakable.AllowList);
const showVeBalLock = computed(() => isVeBalPool(props.pool.id));
</script>

<template>
  <div class="px-2 py-4 flex justify-center">
    <BalBtn
      v-if="stakablePoolIds.includes(pool.id)"
      color="gradient"
      size="sm"
      @click.prevent="emit('click:stake', pool)"
    >
      {{ $t('stake') }}
    </BalBtn>
    <BalBtn
      v-else-if="showVeBalLock"
      tag="router-link"
      :to="{ name: 'get-vebal', query: { returnRoute: $route.name } }"
      color="gradient-pink-yellow"
      size="sm"
    >
      {{ $t('transactionAction.createLock') }}
    </BalBtn>
    <div v-else>{{ $t('notAvailable') }}</div>
  </div>
</template>
