<template>
  <div>
    <div :class="['bal-tab-container', containerClasses]">
      <div
        v-for="(tab, i) in tabs"
        :key="i"
        :class="['bal-tab', stateClasses(tab)]"
        @click="onClick(tab)"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';

interface Tab {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'BalTabs',

  emits: ['selected', 'update:modelValue'],

  props: {
    tabs: { type: Array as PropType<Tab[]>, required: true },
    modelValue: { type: String, default: '' },
    noPad: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    const activeTab = ref(props.modelValue);

    function isActiveTab(tab: Tab): boolean {
      return activeTab.value === tab.value;
    }

    function onClick(tab: Tab) {
      activeTab.value = tab.value;
      emit('selected', tab.value);
      emit('update:modelValue', tab.value);
    }

    const containerClasses = computed(() => {
      return {
        'px-4': !props.noPad
      };
    });

    function stateClasses(tab: Tab): Record<string, boolean> {
      return {
        'border-blue-500 text-blue-500 hover:text-blue-500': isActiveTab(tab),
        'hover:text-black dark:hover:text-white dark:border-gray-900': !isActiveTab(
          tab
        )
      };
    }

    return {
      activeTab,
      onClick,
      containerClasses,
      stateClasses
    };
  }
});
</script>

<style>
.bal-tab {
  @apply border-b -mb-px mr-6 py-3 cursor-pointer;
}

.bal-tab-container {
  @apply flex border-b font-medium text-gray-500 dark:border-gray-900;
}
</style>
