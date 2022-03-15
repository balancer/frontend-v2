<script setup lang="ts">
import { ref } from 'vue';
import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import StakePreview, { StakeAction } from './StakePreview.vue';

type Props = {
  isVisible: boolean;
  pool: DecoratedPoolWithStakedShares;
  action: StakeAction;
};

defineProps<Props>();
const emit = defineEmits(['close']);

const showFireworks = ref(false);

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}
</script>

<template>
  <teleport to="#modal">
    <BalModal :show="isVisible" @close="handleClose" :fireworks="showFireworks">
      <StakePreview
        :pool="pool"
        :action="action"
        @close="handleClose"
        @success="showFireworks = true"
      />
    </BalModal>
  </teleport>
</template>
