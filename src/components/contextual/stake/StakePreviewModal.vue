<script setup lang="ts">
import { ref } from 'vue';

import { PoolWithShares } from '@/services/balancer/subgraph/types';

import StakePreview, { StakeAction } from './StakePreview.vue';

type Props = {
  isVisible: boolean;
  pool: PoolWithShares;
  action: StakeAction;
};

defineProps<Props>();
const emit = defineEmits(['close', 'success']);

const showFireworks = ref(false);

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
    <BalModal :show="isVisible" @close="handleClose" :fireworks="showFireworks">
      <StakePreview
        :pool="pool"
        :action="action"
        @close="handleClose"
        @success="handleSuccess"
      />
    </BalModal>
  </teleport>
</template>
