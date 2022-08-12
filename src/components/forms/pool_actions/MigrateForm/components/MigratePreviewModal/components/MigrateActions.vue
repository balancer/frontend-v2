<script setup lang="ts">
import { computed, toRefs, watch } from 'vue';
import { MigratePoolState } from '@/composables/pools/usePoolMigration';

import useConfig from '@/composables/useConfig';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { MigrateMathResponse } from '../../../composables/useMigrateMath';
import { TransactionActionInfo } from '@/types/transactions';

/**
 * TYPES
 */
type Props = {
  fromPool: Pool;
  toPool: Pool;
  math: MigrateMathResponse;
  disabled?: boolean;
  actions: TransactionActionInfo[];
  migratePoolState: MigratePoolState;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
defineEmits(['setCurrentActionIndex']);
/**
 * STATE
 */
const { shouldFetchBatchSwap } = toRefs(props.math);

/**
 * COMPOSABLES
 */

const { networkConfig } = useConfig();
const { explorerLinks, blockNumber } = useWeb3();

/**
 * COMPUTED
 */
const explorerLink = computed(() =>
  props.migratePoolState.receipt
    ? explorerLinks.txLink(props.migratePoolState.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  () =>
    props.migratePoolState.init ||
    props.migratePoolState.confirming ||
    props.migratePoolState.confirmed
);

/**
 * WATCHERS
 */
watch(
  blockNumber,
  async () => {
    if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
      await props.math.getBatchSwap();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <BalActionSteps
      v-if="!migratePoolState.confirmed"
      :actions="actions"
      :disabled="disabled"
      @set-current-action-index="$emit('setCurrentActionIndex', $event)"
    />
    <template v-else>
      <div
        class="flex justify-between items-center mt-4 text-sm text-gray-400 dark:text-gray-600"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ migratePoolState.confirmedAt }}
          </span>
        </div>
        <BalLink
          :href="explorerLink"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <BalBtn
        tag="router-link"
        :to="{ name: 'pool', params: { id: toPool.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('goToMigratedPool') }}
      </BalBtn>
    </template>
  </div>
</template>
