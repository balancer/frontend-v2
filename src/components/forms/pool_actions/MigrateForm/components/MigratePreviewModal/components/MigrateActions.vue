<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { usePoolMigration } from '@/composables/pools/usePoolMigration';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import useConfig from '@/composables/useConfig';
import { configService } from '@/services/config/config.service';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { MigrateMathResponse } from '../../../composables/useMigrateMath';

/**
 * TYPES
 */
type Props = {
  fromPool: Pool;
  toPool: Pool;
  math: MigrateMathResponse;
  disabled?: boolean;
  stakedPoolValue?: string;
  unstakedPoolValue?: string;
  stakedBptBalance: string;
  unstakedBptBalance: string;
  isStakedMigrationEnabled: boolean;
  isUnstakedMigrationEnabled: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'success'): void;
}>();
/**
 * STATE
 */
const { shouldFetchBatchSwap } = toRefs(props.math);

/**
 * COMPOSABLES
 */

const { networkConfig } = useConfig();
const { explorerLinks, blockNumber } = useWeb3();

const relayerAddress = ref(configService.network.addresses.batchRelayer);
const relayerApproval = useRelayerApprovalQuery(relayerAddress);

const { actions, migratePoolState } = usePoolMigration(
  props.stakedBptBalance,
  props.unstakedBptBalance,
  props.unstakedPoolValue,
  props.isUnstakedMigrationEnabled,
  props.stakedPoolValue,
  props.isStakedMigrationEnabled,
  props.fromPool,
  relayerApproval.data
);

/**
 * COMPUTED
 */
const explorerLink = computed(() =>
  migratePoolState.value.receipt
    ? explorerLinks.txLink(migratePoolState.value.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  () =>
    migratePoolState.value.init ||
    migratePoolState.value.confirming ||
    migratePoolState.value.confirmed
);

/**
 * WATCHERS
 */
watch(blockNumber, async () => {
  if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
    await props.math.getBatchSwap();
  }
});

watch(
  () => migratePoolState.value.confirmed,
  confirmed => {
    if (confirmed) {
      emit('success');
    }
  }
);
</script>

<template>
  <div>
    <BalActionSteps
      v-if="!migratePoolState.confirmed"
      :actions="actions"
      :disabled="disabled"
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
