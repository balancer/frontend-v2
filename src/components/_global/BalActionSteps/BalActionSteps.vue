<script setup lang="ts">
/**
 * A series of actions the user must perform, displayed horizontally as a series of dots
 * As each action is in progress or completed the dot changes to reflect its
 * current state.
 *
 * Useful if there are an arbitrary number of actions the user must take such as
 * "approve n tokens, then add liquidity to a pool.""
 */
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import { Step, StepState } from '@/types';
import {
  TransactionActionInfo,
  TransactionActionState,
} from '@/types/transactions';
import signature from '@/assets/images/icons/signature.svg';
import { useI18n } from 'vue-i18n';
import {
  TransactionAction,
  postConfirmationDelay,
} from '@/composables/useTransactions';
import { captureBalancerException, useErrorMsg } from '@/lib/utils/errors';

/**
 * TYPES
 */
type Props = {
  actions: TransactionActionInfo[];
  primaryActionType: TransactionAction;
  disabled?: boolean;
  // override action state loading prop and show
  // loading for all steps
  isLoading?: boolean;
  // override action state loading label
  // for all steps
  loadingLabel?: string;
};

type BalStepAction = {
  label: string;
  loadingLabel: string;
  pending: boolean;
  step: Step;
  promise: () => Promise<void>;
  isSignAction?: boolean;
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
  (e: 'success', tx: TransactionReceipt, confirmedAt: string): void;
  (e: 'failed'): void;
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
const actionStates = ref<TransactionActionState[]>([]);

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  actionStates.value = props.actions.map(() => ({
    ...defaultActionState,
  }));
});

/**
 * WATCHERS
 */
watch(
  () => props.actions,
  newActions => {
    newActions.forEach((action, i) => {
      _actions.value[i] = action;
      if (!actionStates.value[i]) {
        actionStates.value[i] = {
          ...defaultActionState,
        };
      }
    });
  },
  { deep: true }
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
const { formatErrorMsg } = useErrorMsg();
const { t } = useI18n();

/**
 * COMPUTED
 */

const actions = computed((): BalStepAction[] => {
  return _actions.value.map((actionInfo, idx) => {
    const actionState = actionStates.value[idx];
    return {
      label: actionInfo.label,
      loadingLabel: actionState.init
        ? actionInfo.loadingLabel
        : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: submit.bind(null, actionInfo, actionState),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx),
      },
    };
  });
});

const currentAction = computed(
  (): BalStepAction | undefined => actions.value[currentActionIndex.value]
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

const _loadingLabel = computed((): string => {
  if (currentAction.value?.pending) return currentAction.value.loadingLabel;
  return props.loadingLabel || t('loading');
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
  actionInfo: TransactionActionInfo,
  state: TransactionActionState
): Promise<void> {
  const { action } = actionInfo;
  try {
    state.init = true;
    state.error = null;

    const tx = await action();

    state.init = false;
    state.confirming = true;

    if (currentAction.value?.isSignAction) {
      handleSignAction(state);
      return;
    }

    if (tx) handleTransaction(tx, state, actionInfo);
  } catch (error) {
    state.init = false;
    state.confirming = false;
    state.error = formatErrorMsg(error);
    captureBalancerException({
      error: (error as Error)?.cause || error,
      action: props.primaryActionType,
      context: { level: 'fatal' },
    });
  }
}

function handleSignAction(state: TransactionActionState) {
  currentActionIndex.value += 1;
  state.confirming = false;
  state.confirmed = true;
}

async function handleTransaction(
  tx: TransactionResponse,
  state: TransactionActionState,
  actionInfo: TransactionActionInfo
): Promise<void> {
  const { postActionValidation, actionInvalidReason } = actionInfo;

  await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      state.receipt = receipt;

      await postConfirmationDelay(tx);

      const isValid = await postActionValidation?.();
      if (isValid || !postActionValidation) {
        const confirmedAt = await getTxConfirmedAt(receipt);
        state.confirmedAt = dateTimeLabelFor(confirmedAt);
        state.confirmed = true;
        if (currentActionIndex.value >= actions.value.length - 1) {
          emit('success', receipt, state.confirmedAt);
        } else {
          currentActionIndex.value += 1;
        }
      } else {
        // post action validation failed, display reason.
        if (actionInvalidReason) state.error = actionInvalidReason;
        state.init = false;
      }
      state.confirming = false;
    },
    onTxFailed: () => {
      state.confirming = false;
      emit('failed');
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
          :loadingLabel="_loadingLabel"
          block
          @click="currentAction?.promise()"
        >
          <div
            :class="{
              'flex grow justify-between items-center':
                currentAction?.isSignAction,
            }"
          >
            <img v-if="currentAction?.isSignAction" :src="signature" />
            {{ currentAction?.label }}
            <div v-if="currentAction?.isSignAction" class="w-8"></div>
          </div>
        </BalBtn>
      </BalStack>
    </AnimatePresence>
  </div>
</template>
