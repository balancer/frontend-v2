<script setup lang="ts">
import { computed } from 'vue';

import { TokenInfo } from '@/types/TokenList';

type Props = {
  tokens: TokenInfo[];
  label: string;
};

const props = withDefaults(defineProps<Props>(), {
  tokens: () => []
});

const addresses = computed(() => props.tokens.map(t => t.address));

const emit = defineEmits<{
  (e: 'click', address: string): void;
}>();
</script>
<template>
  <div
    :class="[
      'border border-gray-100 dark:border-gray-900 rounded-lg',
      'bg-white dark:bg-gray-850',
      'flex flex-wrap items-center gap-3',
      'text-gray-900 dark:text-gray-400',
      'overflow-x-auto',
      'px-3'
    ]"
  >
    <span
      :class="[
        'border-r border-gray-100 dark:border-gray-900',
        'self-stretch flex items-center',
        'pr-3'
      ]"
    >
      {{ props.label }}
    </span>
    <BalAsset
      v-for="address in addresses"
      :address="address"
      button
      :key="address"
      @click="emit('click', address)"
    />
  </div>
</template>
