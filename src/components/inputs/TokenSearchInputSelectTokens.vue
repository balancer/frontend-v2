<script setup lang="ts">
import { TokenInfo } from '@/types/TokenList';

import TokenSearchInputToken from './TokenSearchInputToken.vue';

type Props = {
  tokens: TokenInfo[];
  label: string;
};

const props = withDefaults(defineProps<Props>(), {
  tokens: () => []
});

const emit = defineEmits<{
  (e: 'click', token: TokenInfo): void;
}>();
</script>
<template>
  <div
    :class="[
      'border border-gray-100 dark:border-gray-800 rounded-lg',
      'flex flex-wrap items-center gap-3',
      'text-gray-900 dark:text-gray-400',
      'overflow-x-auto',
      'px-3'
    ]"
  >
    <span
      :class="['border-r border-gray-100 dark:border-gray-800', 'pr-3 py-1']"
      >{{ props.label }}</span
    >
    <TokenSearchInputToken
      v-for="token in props.tokens"
      :symbol="token.symbol"
      :address="token.address"
      :key="token.symbol"
      @click="emit('click', token)"
    />
  </div>
</template>
