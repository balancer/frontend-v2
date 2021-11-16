<script setup lang="ts">
/**
 * A series of actions the user must perform, displayed horizontally as a series of dots
 * As each action is in progress or completed the dot changes to reflect its
 * current state.
 *
 * Useful if there are an arbitrary number of actions the user must take such as
 * "approve n tokens, then invest in a pool.""
 */
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
import useTransactionErrors from '@/composables/useTransactionErrors';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import { Step, StepState } from '@/types';
import {
  TransactionAction,
  TransactionActionInfo,
  TransactionActionState
} from '@/types/transactions';
import usePoolCreation from '@/composables/pools/usePoolCreation';

/**
 * TYPES
 */
type Props = {
  actions: TransactionActionInfo[];
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

const defaultActionState: TransactionActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
};

/**
 * STATE
 */
const currentActionIndex = ref(0);

const actionStates = props.actions.map(actionInfo => {
  return reactive<TransactionActionState>({
    ...defaultActionState
  });
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
const { parseError } = useTransactionErrors();

/**
 * COMPUTED
 */

const actions = computed((): TransactionAction[] => {
  return props.actions.map((actionInfo, idx) => {
    const actionState = actionStates[idx];
    return {
      label: actionInfo.label,
      loadingLabel: actionState.init
        ? actionInfo.loadingLabel
        : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      promise: submit.bind(null, actionInfo.action, actionState),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx)
      }
    };
  });
});

const currentAction = computed(
  (): TransactionAction => actions.value[currentActionIndex.value]
);

const currentActionState = computed(
  (): TransactionActionState => actionStates[currentActionIndex.value]
);

const steps = computed((): Step[] => actions.value.map(action => action.step));

// const explorerLink = computed((): string =>
//   joinPoolState.receipt
//     ? explorerLinks.txLink(joinPoolState.receipt.transactionHash)
//     : ''
// );

/**
 * METHODS
 */

function getStepState(
  actionState: TransactionActionState,
  index: number
): StepState {
  if (currentActionIndex.value < index) {
    return StepState.Todo;
  } else if (actionState.confirming) return StepState.Pending;
  else if (actionState.init) return StepState.WalletOpen;
  else if (actionState.confirmed) return StepState.Success;
  return StepState.Active;
}

async function submit(
  action: () => Promise<TransactionResponse>,
  state: TransactionActionState
): Promise<void> {
  try {
    state.init = true;

    const tx = await action();

    state.init = false;
    state.confirming = true;

    console.log('Receipt', tx);

    state.confirmed = await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        if (currentActionIndex.value >= actions.value.length - 1) {
          emit('success', receipt);
        }
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
      v-if="currentActionState.error"
      type="error"
      :title="currentActionState.error.title"
      :description="currentActionState.error.description"
      block
      class="mb-4"
    />
    <BalHorizSteps
      v-if="actions.length > 1 && !currentActionState.confirmed"
      :steps="steps"
      class="flex justify-center"
    />
    <BalBtn
      v-if="!currentActionState.confirmed"
      color="gradient"
      class="mt-4"
      :loading="currentAction.pending"
      :loading-label="currentAction.loadingLabel"
      block
      @click="currentAction.promise()"
    >
      {{ currentAction.label }}
    </BalBtn>
    <!--
      TODO: Move this to calling .vue file on complete step.  
       <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ currentActionState.confirmedAt }}
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
    </template> -->
  </div>
</template>
