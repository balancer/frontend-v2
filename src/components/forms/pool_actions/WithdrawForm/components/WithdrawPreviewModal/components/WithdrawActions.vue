<script setup lang="ts">
import { toRef, ref, toRefs, computed, reactive } from 'vue';
import { getPoolWeights } from '@/services/pool/pool.helper';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Step, StepState } from '@/types';
import { WithdrawMathResponse } from '../../../composables/useWithdrawMath';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';
import useConfig from '@/composables/useConfig';
import useWithdrawalState from '../../../composables/useWithdrawalState';
// Services
import PoolExchange from '@/services/pool/exchange/exchange.service';
import useTranasactionErrors, {
  TransactionError
} from '@/composables/useTransactionErrors';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  math: WithdrawMathResponse;
};

type Action = {
  label: string;
  loadingLabel: string;
  pending: boolean;
  step: Step;
  promise: () => Promise<void>;
};

type WithdrawalState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  error?: TransactionError | null;
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
const currentActionIndex = ref(0);
const withdrawalState = reactive<WithdrawalState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const route = useRoute();
const { t } = useI18n();
const { networkConfig } = useConfig();
const { account, getProvider, explorerLinks } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { parseError } = useTranasactionErrors();

const { tokenOutIndex, tokensOut } = useWithdrawalState(toRef(props, 'pool'));

const {
  bptIn,
  fiatTotalLabel,
  amountsOut,
  exactOut,
  singleAssetMaxOut
} = toRefs(props.math);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const withdrawalStepState = computed(
  (): StepState => {
    if (withdrawalState.confirming) return StepState.Pending;
    else if (withdrawalState.init) return StepState.WalletOpen;
    else if (withdrawalState.confirmed) return StepState.Success;

    return StepState.Active;
  }
);

const actions = computed((): Action[] => [
  {
    label: t('withdraw.label'),
    loadingLabel: withdrawalState.init
      ? t('withdraw.preview.loadingLabel.withdraw')
      : t('confirming'),
    pending: withdrawalState.init || withdrawalState.confirming,
    promise: submit,
    step: {
      tooltip: t('withdraw.preview.tooltips.withdrawStep'),
      state: withdrawalStepState.value
    }
  }
]);

const currentAction = computed(
  (): Action => actions.value[currentActionIndex.value]
);

const steps = computed((): Step[] => actions.value.map(action => action.step));

const explorerLink = computed((): string =>
  withdrawalState.receipt
    ? explorerLinks.txLink(withdrawalState.receipt.transactionHash)
    : ''
);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: t('transactionSummary.withdrawFromPool', [
      fiatTotalLabel.value,
      getPoolWeights(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  withdrawalState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      withdrawalState.confirming = false;
      withdrawalState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      withdrawalState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      withdrawalState.confirming = false;
    }
  });
}

async function submit(): Promise<void> {
  try {
    withdrawalState.init = true;

    const tx = await poolExchange.exit(
      getProvider(),
      account.value,
      amountsOut.value,
      tokensOut.value,
      bptIn.value,
      singleAssetMaxOut.value ? tokenOutIndex.value : null,
      exactOut.value
    );

    withdrawalState.init = false;
    withdrawalState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
  } catch (error) {
    withdrawalState.init = false;
    withdrawalState.confirming = false;
    withdrawalState.error = parseError(error);
    console.error(error);
  }
}
</script>

<template>
  <div>
    <BalAlert
      v-if="withdrawalState.error"
      type="error"
      :title="withdrawalState.error.title"
      :description="withdrawalState.error.description"
      block
      class="mb-4"
    />
    <BalHorizSteps
      v-if="actions.length > 1 && !withdrawalState.confirmed"
      :steps="steps"
      class="flex justify-center"
    />
    <BalBtn
      v-if="!withdrawalState.confirmed"
      color="gradient"
      class="mt-4"
      :disabled="currentAction.pending"
      :loading="currentAction.pending"
      :loading-label="currentAction.loadingLabel"
      block
      @click="currentAction.promise()"
    >
      {{ currentAction.label }}
    </BalBtn>
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ withdrawalState.confirmedAt }}
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
        :to="{ name: 'pool', params: { id: route.params.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('returnToPool') }}
      </BalBtn>
    </template>
  </div>
</template>
