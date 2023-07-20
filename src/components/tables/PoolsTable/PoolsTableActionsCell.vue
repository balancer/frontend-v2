<script setup lang="ts">
import { computed, toRef } from 'vue';

import { isVeBalPool, usePoolHelpers } from '@/composables/usePoolHelpers';
import useNetwork from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { Pool } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolsType?: 'unstaked' | 'staked';
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  poolsType: 'unstaked',
});

const emit = defineEmits<{
  (e: 'click:stake', value: Pool): void;
  (e: 'click:unstake', value: Pool): void;
  (e: 'click:migrate', value: Pool): void;
}>();
/**
 * COMPOSABLES
 */
const { isMigratablePool } = usePoolHelpers(toRef(props, 'pool'));
const { networkSlug } = useNetwork();

/** COMPUTED */
const stakablePoolIds = computed((): string[] =>
  POOLS.Stakable.VotingGaugePools.concat(POOLS.Stakable.AllowList)
);
const showVeBalLock = computed(() => isVeBalPool(props.pool.id));
</script>

<template>
  <div class="flex justify-center py-4 px-2">
    <BalBtn
      v-if="isMigratablePool(pool)"
      color="gradient"
      size="sm"
      @click.prevent.stop="emit('click:migrate', pool)"
    >
      {{ $t('migrate') }}
    </BalBtn>
    <BalBtn
      v-else-if="poolsType === 'unstaked' && stakablePoolIds.includes(pool.id)"
      color="gradient"
      size="sm"
      :disabled="isMigratablePool(pool)"
      @click.prevent.stop="emit('click:stake', pool)"
    >
      {{ $t('stake') }}
    </BalBtn>
    <BalBtn
      v-else-if="poolsType === 'staked'"
      class="dark:text-gray-300 dark:border-gray-300"
      outline
      size="sm"
      @click.prevent.stop="emit('click:unstake', pool)"
    >
      {{ $t('unstake') }}
    </BalBtn>
    <BalBtn
      v-else-if="showVeBalLock"
      tag="router-link"
      :to="{
        name: 'get-vebal',
        query: {
          networkSlug,
          returnRoute: $route.name,
          returnParams: JSON.stringify({
            networkSlug,
          }),
        },
      }"
      color="gradient-pink-yellow"
      size="sm"
    >
      {{ $t('transactionAction.createLock') }}
    </BalBtn>
    <div v-else>-</div>
  </div>
</template>
