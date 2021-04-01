<template>
  <div>
    <div :class="['bal-tab-container', containerClasses]">
      <div
        v-for="(tab, i) in tabs"
        :key="i"
        :class="['bal-tab', stateClasses(tab)]"
        @click="onClick(tab)"
      >
        {{ tab }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';

export default defineComponent({
  name: 'BalTabs',

  emits: ['selected', 'update:modelValue'],

  props: {
    tabs: { type: Array as PropType<string[]>, required: true },
    modelValue: { type: String, default: '' },
    noPad: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    const activeTab = ref(props.modelValue);

    function isActiveTab(tab) {
      return activeTab.value === tab;
    }

    function onClick(tab) {
      activeTab.value = tab;
      emit('selected', tab);
      emit('update:modelValue', tab);
    }

    const containerClasses = computed(() => {
      return {
        'px-4': !props.noPad
      };
    });

    function stateClasses(tab): Record<string, boolean> {
      return {
        'border-blue-500 text-blue-500 hover:text-blue-500': isActiveTab(tab),
        'hover:text-black': !isActiveTab(tab)
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
  @apply border-b -mb-px mr-4 py-3 cursor-pointer;
}

.bal-tab-container {
  @apply flex border-b font-medium text-gray-500;
}
</style>
