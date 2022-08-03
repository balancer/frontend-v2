<script setup lang="ts">
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { usePoolMigration } from '@/composables/pools/usePoolMigration';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import useConfig from '@/composables/useConfig';
import { configService } from '@/services/config/config.service';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';
import { MigrateMathResponse } from '../../../composables/useMigrateMath';

/**
 * TYPES
 */
type Props = {
  fromPool: Pool;
  toPool: Pool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  math: MigrateMathResponse;
  fiatTotal: string;
  disabled?: boolean;
  stakedPoolValue?: string;
  unstakedPoolValue?: string;
  isStakedMigrationEnabled: boolean;
  isUnstakedMigrationEnabled: boolean;
};

type MigratePoolState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const migratePoolState = reactive<MigratePoolState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
});

/**
 * COMPOSABLES
 */
const { networkConfig } = useConfig();
const { explorerLinks } = useWeb3();

const relayerAddress = ref(configService.network.addresses.batchRelayer);
const relayerApproval = useRelayerApprovalQuery(relayerAddress);

const { actions } = usePoolMigration(
  props.math.bptBalanceScaled.value,
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
  migratePoolState.receipt
    ? explorerLinks.txLink(migratePoolState.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  () =>
    migratePoolState.init ||
    migratePoolState.confirming ||
    migratePoolState.confirmed
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
