<script lang="ts" setup>
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';

import { TransactionActionState } from '@/types/transactions';

/**
 * TYPES
 */
type Props = {
  voteState: TransactionActionState;
  disabled: boolean;
  loading: boolean;
};

/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (e: 'click:close'): void;
  (e: 'click:submit'): void;
}>();
</script>

<template>
  <div>
    <template v-if="voteState.receipt">
      <ConfirmationIndicator :txReceipt="voteState.receipt" class="mb-2" />
      <BalBtn
        v-if="voteState.receipt"
        color="gray"
        outline
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
      :loadingLabel="
        voteState.init
          ? $t('veBAL.liquidityMining.popover.actions.vote.loadingLabel')
          : $t('veBAL.liquidityMining.popover.actions.vote.confirming')
      "
      @click.prevent="emit('click:submit')"
    >
      <slot></slot>
    </BalBtn>
  </div>
</template>
