<script setup lang="ts">
import { ref } from 'vue';

/**
 * TYPES
 */
type Props = {
  options: Array<any>;
};

/**
 * PROPS & EMITS
 */
defineProps<Props>();

const emit = defineEmits<{
  (e: 'selected', value: any): void;
}>();

/**
 * STATE
 */
const showDropdown = ref(false);

/**
 * METHODS
 */
function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value;
}

function hideDropdown(): void {
  showDropdown.value = false;
}

function handleRowClick(option: any): void {
  emit('selected', option);
  hideDropdown();
}
</script>

<template>
  <div class="relative" v-click-outside="hideDropdown">
    <div class="activator" @click="toggleDropdown">
      <slot name="activator" />
    </div>
    <div class="bal-dropdown" v-if="showDropdown">
      <div
        v-for="(option, i) in options"
        :key="i"
        class="bal-dropdown-row"
        @click="handleRowClick(option)"
      >
        <slot name="option" :option="option" />
      </div>
    </div>
  </div>
</template>

<style>
.bal-dropdown {
  @apply absolute bg-white shadow border rounded-lg z-10 divide-y;
}

.bal-dropdown-row {
  @apply p-3 whitespace-nowrap hover:bg-gray-50 cursor-pointer;
}
</style>
