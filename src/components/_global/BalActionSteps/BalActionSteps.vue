<script setup lang="ts">
/**
 * A series of actions the user must perform, displayed horizontally as a series of dots
 * As each action is in progress or completed the dot changes to reflect its
 * current state.
 *
 * Useful if there are an arbitrary number of actions the user must take such as
 * "approve n tokens, then invest in a pool.""
 */
import { ChainId } from '@aave/protocol-js';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, ref, watch } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactionErrors from '@/composables/useTransactionErrors';
import { configService } from '@/services/config/config.service';
import { Step, StepState } from '@/types';
import {
  TransactionAction,
  TransactionActionInfo,
  TransactionActionState,
} from '@/types/transactions';

/**
 * TYPES
 */
type Props = {
  actions: TransactionActionInfo[];
  disabled?: boolean;
  // override action state loading prop and show
  // loading for all steps
  isLoading?: boolean;
  // override action state loading label
  // for all steps
  loadingLabel?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isLoading: false,
  loadingLabel: '',
});

const emit = defineEmits<{
  (e: 'success', value: any): void;
  (e: 'setCurrentActionIndex', value: number): void;
}>();

const defaultActionState: TransactionActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
};

/**
 * STATE
 */
const currentActionIndex = ref(0);
const _actions = ref<TransactionActionInfo[]>(props.actions);

const actionStates = ref(
  _actions.value.map(() => ({
    ...defaultActionState,
  }))
);

/**
 * WATCHERS
 */
watch(
  () => [props.actions, props.isLoading],
  () => {
    _actions.value = props.actions;
    actionStates.value = _actions.value.map(() => ({
      ...defaultActionState,
    }));
  },
  {
    deep: true,
  }
);

watch(
  () => currentActionIndex.value,
  (val: number) => {
    emit('setCurrentActionIndex', val);
  },
  { immediate: true }
);
/**
 * COMPOSABLES
 */
const { txListener, getTxConfirmedAt } = useEthers();
const { parseError } = useTransactionErrors();

/**
 * COMPUTED
 */

const actions = computed((): TransactionAction[] => {
  return _actions.value.map((actionInfo, idx) => {
    const actionState = actionStates.value[idx];
    return {
      label: actionInfo.label,
      loadingLabel: actionState.init
        ? actionInfo.loadingLabel
        : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: submit.bind(null, actionInfo.action, actionState),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx),
      },
    };
  });
});

const currentAction = computed(
  (): TransactionAction => actions.value[currentActionIndex.value]
);

const currentActionState = computed(
  (): TransactionActionState => actionStates.value[currentActionIndex.value]
);

const lastActionState = computed(
  (): TransactionActionState =>
    actionStates.value[actionStates.value.length - 1]
);

const steps = computed((): Step[] => actions.value.map(action => action.step));

const spacerWidth = computed((): number => {
  return 13 - steps.value.length;
});

/**
 * METHODS
 */

function getStepState(
  actionState: TransactionActionState,
  index: number
): StepState {
  if (currentActionIndex.value < index) return StepState.Todo;
  else if (actionState.confirming) return StepState.Pending;
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
    state.error = null;

    const tx = await action();

    state.init = false;
    state.confirming = true;

    if (currentAction.value.isSignAction) {
      handleSignAction(state);
      return;
    }

    handleTransaction(tx, state);
  } catch (error) {
    state.init = false;
    state.confirming = false;
    state.error = parseError(error);
    console.error(error);
  }
}

function handleSignAction(state: TransactionActionState) {
  currentActionIndex.value += 1;
  state.confirming = false;
  state.confirmed = true;
}

async function handleTransaction(
  tx: TransactionResponse,
  state: TransactionActionState
): Promise<void> {
  await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      state.receipt = receipt;

      // need to explicity wait for a number of confirmations
      // on polygon
      if (Number(configService.network.chainId) === ChainId.polygon) {
        await tx.wait(10);
      }

      const confirmedAt = await getTxConfirmedAt(receipt);
      state.confirmedAt = dateTimeLabelFor(confirmedAt);

      if (currentActionIndex.value >= actions.value.length - 1) {
        emit('success', { receipt, confirmedAt: state.confirmedAt });
      } else {
        currentActionIndex.value += 1;
      }

      state.confirming = false;
      state.confirmed = true;
    },
    onTxFailed: () => {
      state.confirming = false;
    },
  });
}
</script>

<template>
  <div>
    <AnimatePresence isVisible>
      <BalAlert
        v-if="currentActionState?.error && !isLoading"
        type="error"
        :title="currentActionState?.error?.title"
        :description="currentActionState?.error?.description"
        block
        class="mb-4"
      />
      <BalStack vertical>
        <BalHorizSteps
          v-if="actions.length > 1 && !lastActionState?.confirmed"
          :steps="steps"
          :spacerWidth="spacerWidth"
          class="flex justify-center"
        />
        <BalBtn
          v-if="!lastActionState?.confirmed"
          :disabled="props.disabled"
          color="gradient"
          :loading="currentAction?.pending || isLoading"
          :loadingLabel="
            isLoading
              ? loadingLabel || $t('loading')
              : currentAction?.loadingLabel
          "
          block
          @click="currentAction.promise()"
        >
          <div
            :class="{
              'flex flex-grow justify-between items-center':
                currentAction.isSignAction,
            }"
          >
            <img
              v-if="currentAction.isSignAction"
              :src="require('@/assets/images/icons/signature.svg')"
            />
            {{ currentAction?.label }}
            <div v-if="currentAction.isSignAction" class="w-8"></div>
          </div>
        </BalBtn>
      </BalStack>
    </AnimatePresence>
  </div>
</template>
