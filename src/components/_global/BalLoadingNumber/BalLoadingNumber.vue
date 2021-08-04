<template>
  <div class="flex items-center">
    <template v-if="type === 'token'">
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <span class="text-gray-300 dark:text-gray-500">.</span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
    </template>
    <template v-else-if="type === 'fiat'">
      <span class="text-gray-300 dark:text-gray-500 mr-px">
        {{ currencySymbol }}
      </span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <span class="text-gray-300 dark:text-gray-500">.</span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
    </template>
  </div>
</template>

<script lang="ts">
import useUserSettings from '@/composables/useUserSettings';
import { FiatSymbol } from '@/constants/currency';
import { defineComponent, computed } from 'vue';
import BalLoadingBlock from '../BalLoadingBlock/BalLoadingBlock.vue';

export default defineComponent({
  name: 'BalLoadingNumber',

  components: {
    BalLoadingBlock
  },

  props: {
    type: {
      type: String,
      default: 'token',
      validator: (val: string): boolean => ['token', 'fiat'].includes(val)
    },
    numberWidth: { type: String, default: '3' },
    numberHeight: { type: String, default: '5' }
  },

  setup(props) {
    const { currency } = useUserSettings();

    const currencySymbol = computed(() => FiatSymbol[currency.value]);

    const blockClasses = computed(() => [
      `w-${props.numberWidth}`,
      `h-${props.numberHeight}`,
      'mr-px'
    ]);

    return { blockClasses, currencySymbol };
  }
});
</script>
