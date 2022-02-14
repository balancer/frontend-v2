<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { TransactionActionInfo } from '@/types/transactions';
import { TokenInfo } from '@/types/TokenList';

import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useConfig from '@/composables/useConfig';

import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';

import useTokenApprovalActions from '@/composables/useTokenApprovalActions';

import { LockType } from '../../../types';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
  lockAmount: string;
  lockEndDate: string;
  lockType: LockType[];
};

type LockState = {
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

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

/**
 * STATE
 */
const lockState = reactive<LockState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { networkConfig } = useConfig();
const { getProvider, explorerLinks } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { tokenApprovalActions } = useTokenApprovalActions(
  [props.lockablePoolTokenInfo.address],
  ref([props.lockAmount]),
  'veBAL'
);

const lockActions = props.lockType.map(lockType => ({
  label: t(`getVeBAL.previewModal.actions.${lockType}.label`, [
    props.lockEndDate
  ]),
  loadingLabel: t(`getVeBAL.previewModal.actions.${lockType}.loadingLabel`),
  confirmingLabel: t(`getVeBAL.previewModal.actions.${lockType}.confirming`),
  action: () => submit(lockType),
  stepTooltip: t(`getVeBAL.previewModal.actions.${lockType}.tooltip`)
}));

const actions = ref<TransactionActionInfo[]>([
  ...tokenApprovalActions,
  ...lockActions
]);

/**
 * COMPUTED
 */
const explorerLink = computed(() =>
  lockState.receipt
    ? explorerLinks.txLink(lockState.receipt.transactionHash)
    : ''
);

/**
 * METHODS
 */
async function handleTransaction(
  tx: TransactionResponse,
  lockType: LockType
): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: lockType,
    summary: t(`transactionSummary.${props.lockType}`),
    details: {
      lockAmount: props.lockAmount,
      lockEndDate: props.lockEndDate,
      lockType: props.lockType
    }
  });

  lockState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      lockState.confirming = false;
      lockState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      lockState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      lockState.confirming = false;
    }
  });
}

async function submit(lockType: LockType) {
  try {
    let tx: TransactionResponse;
    lockState.init = true;

    if (lockType === LockType.CREATE_LOCK) {
      tx = await balancerContractsService.veBAL.createLock(
        getProvider(),
        props.lockAmount,
        props.lockEndDate
      );
    } else if (lockType === LockType.EXTEND_LOCK) {
      tx = await balancerContractsService.veBAL.extendLock(
        getProvider(),
        props.lockEndDate
      );
    } else if (lockType === LockType.INCREASE_LOCK) {
      tx = await balancerContractsService.veBAL.increaseLock(
        getProvider(),
        props.lockAmount
      );
    } else {
      throw new Error('Unsupported lockType provided');
    }

    lockState.init = false;
    lockState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx, lockType);
    return tx;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
</script>

<template>
  <div>
    <BalActionSteps
      v-if="!lockState.confirmed"
      :actions="actions"
      :disabled="disabled"
    />
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ lockState.confirmedAt }}
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
        :to="{ name: 'vebal' }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('getVeBAL.previewModal.returnToVeBalPage') }}
      </BalBtn>
    </template>
  </div>
</template>
