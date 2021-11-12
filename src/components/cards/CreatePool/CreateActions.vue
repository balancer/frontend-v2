<script setup lang="ts">
import { toRef, ref, toRefs, computed, ComputedRef, reactive } from 'vue';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { getPoolWeights } from '@/services/pool/pool.helper';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import useTokenFiatMath from '@/composables/useTokenFiatMath';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';

import useConfig from '@/composables/useConfig';
import useTranasactionErrors, {
  TransactionError
} from '@/composables/useTransactionErrors';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import { Step, StepState, Action } from '@/types';
import usePoolCreation from '@/composables/pools/usePoolCreation';

/**
 * TYPES
 */
type Props = {
  tokenAddresses: string[];
  amounts: string[];
};

type ActionState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  error?: TransactionError | null;
  receipt?: TransactionReceipt;
};

const defaultActionStateValues: ActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
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
const joinPoolState = reactive<ActionState>({ ...defaultActionStateValues });
const createPoolState = reactive<ActionState>({ ...defaultActionStateValues });

const joinPoolStepState = generateStepState(joinPoolState);
const createPoolStepState = generateStepState(createPoolState);

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
const { fiatTotalLabel } = useTokenFiatMath(
  props.tokenAddresses,
  props.amounts
);
const { allApproved, tokenApprovalActions } = useTokenApprovalActions(
  props.tokenAddresses,
  props.amounts,
  currentActionIndex
);
const { createPool, joinPool } = usePoolCreation();

/**
 * COMPUTED
 */

const actions = computed((): Action[] => [
  {
    label: t('createpool'),
    loadingLabel: t('confirming'),
    pending: createPoolState.init || createPoolState.confirming,
    promise: submit.bind(null, createPool, createPoolState),
    step: {
      tooltip: t('createPoolTooltip'),
      state: createPoolStepState.value
    }
  },
  ...tokenApprovalActions.value,
  {
    label: t('joinpool'),
    loadingLabel: joinPoolState.init
      ? t('investment.preview.loadingLabel.investment')
      : t('confirming'),
    pending: joinPoolState.init || joinPoolState.confirming,
    promise: submit.bind(null, joinPool, joinPoolState),
    step: {
      tooltip: t('investmentTooltip'),
      state: joinPoolStepState.value
    }
  }
]);

const currentAction = computed(
  (): Action => actions.value[currentActionIndex.value]
);

const steps = computed((): Step[] => actions.value.map(action => action.step));

const explorerLink = computed((): string =>
  joinPoolState.receipt
    ? explorerLinks.txLink(joinPoolState.receipt.transactionHash)
    : ''
);

/**
 * METHODS
 */

function generateStepState(actionState: ActionState): ComputedRef<StepState> {
  return computed(
    (): StepState => {
      if (tokenApprovalActions.value.length > 0 && !allApproved.value) {
        return StepState.Todo;
      } else if (actionState.confirming) return StepState.Pending;
      else if (actionState.init) return StepState.WalletOpen;
      else if (actionState.confirmed) return StepState.Success;
      return StepState.Active;
    }
  );
}

async function submit(
  action: () => Promise<TransactionResponse>,
  state: ActionState
): Promise<void> {
  try {
    state.init = true;

    const tx = await action();

    state.init = false;
    state.confirming = true;

    console.log('Receipt', tx);

    state.confirmed = await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        emit('success', receipt);
        state.confirming = false;
        state.receipt = receipt;

        const confirmedAt = await getTxConfirmedAt(receipt);
        state.confirmedAt = dateTimeLabelFor(confirmedAt);
        currentActionIndex.value += 1;
      },
      onTxFailed: () => {
        state.confirming = false;
      }
    });
  } catch (error) {
    state.init = false;
    state.confirming = false;
    state.error = parseError(error);
    console.error(error);
  }
}
</script>

<template>
  <div>
    <BalAlert
      v-if="joinPoolState.error"
      type="error"
      :title="joinPoolState.error.title"
      :description="joinPoolState.error.description"
      block
      class="mb-4"
    />
    <BalHorizSteps
      v-if="actions.length > 1 && !joinPoolState.confirmed"
      :steps="steps"
      class="flex justify-center"
    />
    <BalBtn
      v-if="!joinPoolState.confirmed"
      color="gradient"
      class="mt-4"
      :loading="currentAction.pending"
      :loading-label="currentAction.loadingLabel"
      block
      @click="currentAction.promise()"
    >
      AA{{ currentAction.label }}
    </BalBtn>
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ joinPoolState.confirmedAt }}
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
