<script setup lang="ts">
import { toRef, ref, toRefs, computed, reactive } from 'vue';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { getPoolWeights } from '@/services/pool/pool.helper';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { InvestMathResponse } from '../../../composables/useInvestMath';
import {
  Step,
  StepState
} from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';
// Composables
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';
import useTokenApprovals, {
  ApprovalState
} from '@/composables/pools/useTokenApprovals';
import useConfig from '@/composables/useConfig';
import useTranasactionErrors, {
  TransactionError
} from '@/composables/useTransactionErrors';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  math: InvestMathResponse;
  tokenAddresses: string[];
};

type Action = {
  label: string;
  loadingLabel: string;
  pending: boolean;
  step: Step;
  promise: () => Promise<void>;
};

type InvestmentState = {
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
const investmentState = reactive<InvestmentState>({
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
const { getToken } = useTokens();
const { account, getProvider, explorerLinks } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { parseError } = useTranasactionErrors();
const { fullAmounts, bptOut, fiatTotalLabel } = toRefs(props.math);

const { requiredApprovalState, approveToken } = useTokenApprovals(
  props.tokenAddresses,
  fullAmounts
);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const allApproved = computed((): boolean =>
  Object.values(requiredApprovalState.value).every(state => state.approved)
);

const approvalActions = computed((): Action[] => {
  return Object.keys(requiredApprovalState.value).map((address, i) => {
    const token = getToken(address);
    const state = requiredApprovalState.value[address];

    return {
      label: t('transactionSummary.approveForInvesting', [token.symbol]),
      loadingLabel: state.init
        ? t('investment.preview.loadingLabel.approval')
        : t('confirming'),
      pending: state.init || state.confirming,
      promise: async () => {
        const confirmed = await approveToken(token.address);
        if (confirmed) currentActionIndex.value += 1;
      },
      step: {
        tooltip: t('investment.preview.tooltips.approval', [token.symbol]),
        state: approvalStepState(state, i)
      }
    };
  });
});

const investStepState = computed(
  (): StepState => {
    if (approvalActions.value.length > 0 && !allApproved.value) {
      return StepState.Todo;
    } else if (investmentState.confirming) return StepState.Pending;
    else if (investmentState.init) return StepState.WalletOpen;
    else if (investmentState.confirmed) return StepState.Success;

    return StepState.Active;
  }
);

const actions = computed((): Action[] => [
  ...approvalActions.value,
  {
    label: t('invest'),
    loadingLabel: investmentState.init
      ? t('investment.preview.loadingLabel.investment')
      : t('confirming'),
    pending: investmentState.init || investmentState.confirming,
    promise: submit,
    step: {
      tooltip: t('investmentTooltip'),
      state: investStepState.value
    }
  }
]);

const currentAction = computed(
  (): Action => actions.value[currentActionIndex.value]
);

const steps = computed((): Step[] => actions.value.map(action => action.step));

const explorerLink = computed((): string =>
  investmentState.receipt
    ? explorerLinks.txLink(investmentState.receipt.transactionHash)
    : ''
);

/**
 * METHODS
 */
function approvalStepState(state: ApprovalState, index: number): StepState {
  if (state.confirming) {
    return StepState.Pending;
  } else if (state.init) {
    return StepState.WalletOpen;
  } else if (!state.approved && index === currentActionIndex.value) {
    return StepState.Active;
  } else if (state.approved) {
    return StepState.Success;
  } else {
    return StepState.Todo;
  }
}

async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('transactionSummary.investInPool', [
      fiatTotalLabel.value,
      getPoolWeights(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  investmentState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      investmentState.confirming = false;
      investmentState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      investmentState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      investmentState.confirming = false;
    }
  });
}

async function submit(): Promise<void> {
  try {
    investmentState.init = true;

    const tx = await poolExchange.join(
      getProvider(),
      account.value,
      fullAmounts.value,
      props.tokenAddresses,
      bptOut.value
    );

    investmentState.init = false;
    investmentState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
  } catch (error) {
    investmentState.init = false;
    investmentState.confirming = false;
    investmentState.error = parseError(error);
    console.error(error);
  }
}
</script>

<template>
  <div>
    <BalAlert
      v-if="investmentState.error"
      type="error"
      :title="investmentState.error.title"
      :description="investmentState.error.description"
      block
      class="mb-4"
    />
    <BalHorizSteps
      v-if="actions.length > 1 && !investmentState.confirmed"
      :steps="steps"
      class="flex justify-center"
    />
    <BalBtn
      v-if="!investmentState.confirmed"
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
            {{ investmentState.confirmedAt }}
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
