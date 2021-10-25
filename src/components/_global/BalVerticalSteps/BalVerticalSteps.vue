<script lang="ts" setup>
import { useClassName } from '@/components/utils';
import { computed } from 'vue';

type Props = {
  title: string;
  steps: Step[];
};

enum StepState {
  Todo,
  Active,
  Success
}

type Step = {
  tooltip: string;
  state: StepState;
};

const props = defineProps<Props>();

const stepTextClasses = computed(() => {
  return props.steps.map(step => {
    return useClassName(step.state, [
      [StepState.Active, 'text-blue-400 font-semibold hover:text-blue-800'],
      [StepState.Todo, 'text-gray-400 font-normal hover:text-blue-500'],
      [StepState.Success, 'text-green-500 font-semibold']
    ]);
  });
});

const stepCircleClasses = computed(() => {
  return props.steps.map(step => {
    return useClassName(step.state, [
      [
        StepState.Active,
        'border-2 border-none bg-gradient-from-l bg-gradient-to-r from-blue-600 to-blue-50 text-white'
      ],
      [StepState.Todo, 'border-2 border-gray-400 text-gray-500'],
      [
        StepState.Success,
        'border-2 border-none bg-gradient-to-tr from-green-500 to-green-200 text-white'
      ]
    ]);
  });
});
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>{{ title }}</h6>
    </div>
    <div class="p-4">
      <BalStack
        horizontal
        v-for="(step, i) in steps"
        :key="`vertical-step-${i}`"
        class="mb-4 items-center"
      >
        <div
          :class="[
            'relative text-sm rounded-full w-7 h-7 flex justify-center items-center',
            stepCircleClasses[i],
            { 'circle-line': i !== steps.length - 1 }
          ]"
        >
          <div
            class="absolute top-0 left-0 right-0 bottom-0 w-4 mx-auto flex justify-center items-center"
          >
            {{ i }}
          </div>
        </div>
        <button :class="['text-gray-500 text-sm', stepTextClasses[i]]">
          {{ step.tooltip }}
        </button>
      </BalStack>
    </div>
  </BalCard>
</template>

<style scoped>
.circle-line::after {
  content: '';
  position: absolute;
  width: 1px;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: -18px;
  height: 17px;
  background-color: lightgray;
}
</style>
