<script lang="ts" setup>
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';

import { TransactionReceipt } from '@ethersproject/abstract-provider';

/**
 * TYPES
 */
type Props = {
  disabled: boolean;
  loading: boolean;
  receipt?: TransactionReceipt;
};

/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  receipt: undefined,
});

const emit = defineEmits<{
  (e: 'click:close'): void;
  (e: 'click:submit'): void;
}>();
</script>

<template>
  <div>
    <template v-if="receipt">
      <ConfirmationIndicator :txReceipt="receipt" class="mb-2" />
      <BalBtn
        v-if="receipt"
        color="gray"
        outline
        v-bind="$attrs"
        block
        @click="emit('click:close')"
      >
        {{ $t('getVeBAL.previewModal.returnToVeBalPage') }}
      </BalBtn>
    </template>
    <BalBtn
      v-else
      color="gradient"
      block
      :disabled="disabled"
      :loading="loading"
      v-bind="$attrs"
      @click.prevent="emit('click:submit')"
    >
      <slot></slot>
    </BalBtn>
  </div>
</template>
