<script setup lang="ts">
interface Tab {
  value: string | number;
  label: string;
}

type Props = {
  tabs: Tab[];
  modelValue: string | number;
  noPad: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  noPad: false,
});

const emit = defineEmits(['selected', 'update:modelValue']);

function isActiveTab(tab: Tab): boolean {
  return props.modelValue === tab.value;
}

function onClick(tab: Tab) {
  emit('selected', tab.value);
  emit('update:modelValue', tab.value);
}

const containerClasses = computed(() => {
  return {
    'px-4': !props.noPad,
  };
});

function stateClasses(tab: Tab): Record<string, boolean> {
  return {
    'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:border-blue-500 font-semibold':
      isActiveTab(tab),
    'hover:text-purple-600 dark:hover:text-yellow-500 dark:border-gray-700 transition-colors':
      !isActiveTab(tab),
  };
}

const lastTab = computed(() => props.tabs[props.tabs.length - 1]);
</script>

<template>
  <div>
    <div :class="['bal-tab-container text-secondary', containerClasses]">
      <div
        v-for="(tab, i) in props.tabs"
        :key="i"
        :class="['bal-tab font-medium', stateClasses(tab)]"
        @click="onClick(tab)"
      >
        {{ tab.label }}
      </div>
      <div :class="['bal-tab font-medium -ml-6 pl-2', stateClasses(lastTab)]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style>
.bal-tab {
  @apply -mb-px mr-6 py-3 cursor-pointer;
}

.bal-tab:last-child {
  @apply mr-0;
}

.bal-tab-container {
  @apply flex border-b dark:border-gray-700;
}
</style>
