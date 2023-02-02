<script setup lang="ts">
import { ref } from 'vue';

import { Pool } from '@/services/pool/types';
import StakePreview, { StakeAction } from './StakePreview.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

type Props = {
  isVisible: boolean;
  pool: Pool;
  action: StakeAction;
};

const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

const showFireworks = ref(false);

providePoolStaking(props.pool.id);

/**
 * METHODS
 */
function handleClose() {
  showFireworks.value = false;
  emit('close');
}

function handleSuccess() {
  showFireworks.value = true;
  emit('success');
}
</script>

<template>
  <teleport to="#modal">
    <BalModal :show="isVisible" :fireworks="showFireworks" @close="handleClose">
      <StakePreview
        :pool="pool"
        :action="action"
        @close="handleClose"
        @success="handleSuccess"
      />
    </BalModal>
  </teleport>
</template>
