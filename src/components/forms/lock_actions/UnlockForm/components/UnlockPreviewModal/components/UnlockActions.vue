<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useConfig from '@/composables/useConfig';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';
import { TransactionActionInfo } from '@/types/transactions';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
  totalLpTokens: string;
};

type UnlockActionState = {
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
  (e: 'success', value: UnlockActionState): void;
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const unlockActionState = reactive<UnlockActionState>({
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
const { getProvider, explorerLinks } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();

const { fNum2 } = useNumbers();

const unlockAction: TransactionActionInfo = {
  label: t(`unlockVeBAL.previewModal.actions.unlock.label`),
  loadingLabel: t(`unlockVeBAL.previewModal.actions.unlock.loadingLabel`),
  confirmingLabel: t(`unlockVeBAL.previewModal.actions.unlock.confirming`),
  action: submit,
  stepTooltip: t(`unlockVeBAL.previewModal.actions.unlock.tooltip`),
};

const actions = ref<TransactionActionInfo[]>([unlockAction]);

/**
 * METHODS
 */
async function handleTransaction(tx: TransactionResponse): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'unlock',
    summary: `${fNum2(props.totalLpTokens, FNumFormats.token)} ${
      props.lockablePoolTokenInfo.symbol
    }`,
    details: {
      totalLpTokens: props.totalLpTokens,
    },
  });

  unlockActionState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', unlockActionState);

      unlockActionState.confirming = false;
      unlockActionState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      unlockActionState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      unlockActionState.confirming = false;
    },
  });
}

async function submit() {
  try {
    let tx: TransactionResponse;
    unlockActionState.init = true;

    tx = await balancerContractsService.veBAL.unlock(getProvider());

    unlockActionState.init = false;
    unlockActionState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
</script>

<template>
  <div>
    <BalActionSteps v-if="!unlockActionState.confirmed" :actions="actions" />
    <template v-else>
      <div
        class="flex justify-between items-center mt-4 text-sm text-gray-400 dark:text-gray-600"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ unlockActionState.confirmedAt }}
          </span>
        </div>
        <BalLink
          v-if="unlockActionState.receipt"
          :href="
            explorerLinks.txLink(unlockActionState.receipt.transactionHash)
          "
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
      <BalBtn color="gray" outline block class="mt-2" @click="emit('close')">
        {{ $t('unlockVeBAL.previewModal.returnToVeBalPage') }}
      </BalBtn>
    </template>
  </div>
</template>
