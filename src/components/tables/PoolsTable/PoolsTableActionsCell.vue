<script setup lang="ts">
import { computed, toRef } from 'vue';

import { isVeBalPool, usePool } from '@/composables/usePool';
import { POOLS } from '@/constants/pools';
import { PoolWithShares } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: PoolWithShares;
  poolsType?: 'unstaked' | 'staked';
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  poolsType: 'unstaked',
});

const emit = defineEmits<{
  (e: 'click:stake', value: PoolWithShares): void;
  (e: 'click:migrate', value: PoolWithShares): void;
}>();
/**
 * COMPOSABLES
 */
const { isMigratablePool } = usePool(toRef(props, 'pool'));

/** COMPUTED */
const stakablePoolIds = computed((): string[] => POOLS.Stakable.AllowList);
const showVeBalLock = computed(() => isVeBalPool(props.pool.id));
</script>

<template>
  <div class="flex justify-center py-4 px-2">
    <BalBtn
      v-if="isMigratablePool(pool)"
      color="gradient"
      size="sm"
      @click.prevent="emit('click:migrate', pool)"
    >
      {{ $t('migrate') }}
    </BalBtn>
    <BalBtn
      v-else-if="poolsType === 'unstaked' && stakablePoolIds.includes(pool.id)"
      color="gradient"
      size="sm"
      :disabled="isMigratablePool(pool)"
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
    <div v-else>-</div>
  </div>
</template>
