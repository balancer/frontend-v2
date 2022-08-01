<script setup lang="ts">
import { computed } from 'vue';

import useWeb3 from '@/services/web3/useWeb3';
import { getConnectorLogo } from '@/services/web3/web3.plugin';
import { Step, StepState } from '@/types';

const stepState = StepState;

/**
 * TYPES
 */
type Props = {
  steps: Step[];
  spacerWidth: number;
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  steps: () => [
    { tooltip: 'You did this', state: StepState.Success },
    { tooltip: 'Wallet is tiggered', state: StepState.WalletOpen },
    { tooltip: 'This is pending', state: StepState.Pending },
    { tooltip: 'Do this now', state: StepState.Active },
    { tooltip: 'Do this next', state: StepState.Todo },
  ],
  spacerWidth: 16,
});

/**
 * COMPOSABLES
 */
const { connector, provider } = useWeb3();

/**
 * COMPUTED
 */
const walletLogo = computed((): string =>
  getConnectorLogo(connector?.value?.id, provider)
);

/**
 * METHODS
 */
function stateClasses(state: StepState): string {
  switch (state) {
    case StepState.Success:
      return 'border-green-500 dark:border-green-500 text-green-500';
    case StepState.Pending:
      return 'border-none dark:border-none text-orange-500';
    case StepState.Active:
      return 'border-purple-500 dark:border-purple-500 text-gradient';
    case StepState.WalletOpen:
      return 'border-purple-500 dark:border-purple-500 text-gradient';
    default:
      return 'dark:border-gray-700';
  }
}
</script>

<template>
  <div class="flex items-center">
    <div v-for="(step, i) in steps" :key="i" class="flex items-center">
      <div
        v-if="i !== 0"
        :class="['h-px bg-gray-100 dark:bg-gray-700', `w-${spacerWidth}`]"
      />
      <BalTooltip :text="step.tooltip" width="44" textAlign="center">
        <template #activator>
          <div :class="['step', stateClasses(step.state)]">
            <BalIcon v-if="step.state === stepState.Success" name="check" />
            <img
              v-else-if="step.state === stepState.WalletOpen"
              :src="walletLogo"
              class="w-4 h-4"
            />
            <template v-else-if="step.state === stepState.Pending">
              <span
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                {{ i + 1 }}
              </span>
              <SpinnerIcon class="w-8 h-8 animate-spin" />
            </template>
            <span v-else>
              {{ i + 1 }}
            </span>
          </div>
        </template>
      </BalTooltip>
    </div>
  </div>
</template>

<style scoped>
.step {
  @apply w-8 h-8 rounded-full border shadow font-medium;
  @apply flex items-center justify-center relative;
}
</style>
