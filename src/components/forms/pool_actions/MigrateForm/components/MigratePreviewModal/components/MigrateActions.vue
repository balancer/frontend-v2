<script setup lang="ts">
import { StablePoolEncoder, WeightedPoolEncoder } from '@balancer-labs/sdk';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber, BigNumberish } from 'ethers';
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePoolMigration } from '@/composables/pools/usePoolMigration';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import useConfig from '@/composables/useConfig';
import useEthers from '@/composables/useEthers';
import { isStableLike } from '@/composables/usePool';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import useUserSettings from '@/composables/useUserSettings';
// Libs
import { balancer } from '@/lib/balancer.sdk';
// Services
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
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
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const { shouldFetchBatchSwap } = toRefs(props.math);

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

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
const { t } = useI18n();
const { networkConfig } = useConfig();
const { getProvider, explorerLinks, account, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { slippageScaled } = useUserSettings();

const relayerAddress = ref(configService.network.addresses.batchRelayer);
const relayerApproval = useRelayerApprovalQuery(relayerAddress);

const { actions } = usePoolMigration(
  props.math.bptBalance.value,
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

/**
 * WATCHERS
 */
watch(blockNumber, async () => {
  if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
    // await props.math.getBatchSwap();
  }
});
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
