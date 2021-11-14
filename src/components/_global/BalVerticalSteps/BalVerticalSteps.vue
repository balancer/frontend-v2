<script lang="ts" setup>
import { getActiveClassName } from '@/components/utils';
import { computed } from 'vue';
import { StepState } from '../BalHorizSteps/BalHorizSteps.vue';

type Props = {
  title: string;
  steps: Step[];
};

type Step = {
  tooltip: string;
  state: StepState;
  isVisible?: boolean;
};

const props = defineProps<Props>();

const visibleSteps = computed(() => {
  return props.steps.filter(
    step => step.isVisible === undefined || step.isVisible
  );
});

const stepTextClasses = computed(() => {
  return visibleSteps.value.map(step => {
    return getActiveClassName(step.state, [
      [StepState.Active, 'text-blue-400 font-semibold hover:text-blue-800'],
      [StepState.Todo, 'text-gray-400 font-normal hover:text-blue-500'],
      [StepState.Success, 'text-green-500 font-semibold'],
      [StepState.Warning, 'text-red-500 font-semibold']
    ]);
  });
});

const stepCircleClasses = computed(() => {
  return visibleSteps.value.map(step => {
    return getActiveClassName(step.state, [
      [
        StepState.Active,
        'border-2 border-none bg-gradient-from-l bg-gradient-to-r from-blue-600 to-blue-50 text-white'
      ],
      [StepState.Todo, 'border-2 border-gray-400 text-gray-500'],
      [
        StepState.Success,
        'border-2 border-none bg-gradient-to-tr from-green-500 to-green-200 text-white'
      ],
      [StepState.Warning, 'border-2 border-none bg-red-500 text-white']
    ]);
  });
});
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>{{ title }}</h6>
    </div>
    <BalStack vertical isDynamic spacing="sm" class="p-4">
      <div
        v-for="(step, i) in visibleSteps"
        :key="`vertical-step-${step.tooltip}`"
      >
        <button>
          <BalStack horizontal align="center" spacing="sm">
            <div
              :class="[
                'relative text-sm rounded-full w-7 h-7 flex justify-center items-center',
                stepCircleClasses[i],
                { 'circle-line': i !== visibleSteps.length - 1 }
              ]"
            >
              <div
                class="absolute top-0 left-0 right-0 bottom-0 w-4 mx-auto flex justify-center items-center"
              >
                <span
                  v-if="
                    ![StepState.Warning, StepState.Error].includes(step.state)
                  "
                  >{{ i + 1 }}</span
                >
                <span v-else>!</span>
              </div>
            </div>
            <span :class="['text-sm', stepTextClasses[i]]">
              {{ step.tooltip }}
            </span>
          </BalStack>
        </button>
      </div>
    </BalStack>
  </BalCard>
</template>

<style scoped>
.circle-line::after {
  @apply absolute left-0 right-0 my-0 mx-auto bg-gray-300 w-px;
  content: '';
  bottom: -17px;
  height: 17px;
}
</style>
