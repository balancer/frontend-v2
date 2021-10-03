<script setup lang="ts">
/**
 * TYPES
 */
export type StepState = 'todo' | 'active' | 'pending' | 'success';
export type Step = {
  tooltip: string;
  state: StepState;
};

type Props = {
  steps: Step[];
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  steps: () => [
    { tooltip: 'You did this', state: 'success' },
    { tooltip: 'This is pending', state: 'pending' },
    { tooltip: 'Do this now', state: 'active' },
    { tooltip: 'Do this next', state: 'todo' }
  ]
});

/**
 * METHODS
 */
function stateClasses(state: StepState): string {
  switch (state) {
    case 'success':
      return 'border-green-500 text-green-500';
    case 'pending':
      return 'border-none text-yellow-500';
    case 'active':
      return 'border-purple-500 text-gradient';
    default:
      return '';
  }
}
</script>

<template>
  <div class="flex items-center">
    <div v-for="(step, i) in steps" :key="i" class="flex items-center">
      <div v-if="i !== 0" class="h-px bg-gray-100 w-16" />
      <BalTooltip :text="step.tooltip" width="44" textCenter>
        <template v-slot:activator>
          <div :class="['step', stateClasses(step.state)]">
            <BalIcon v-if="step.state === 'success'" name="check" />
            <template v-else-if="step.state === 'pending'">
              <span
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                {{ i + 1 }}
              </span>
              <SpinnerIcon class="h-8 w-8 animate-spin" />
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
