<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import StakePreview from './StakePreview.vue';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { StakeAction } from './composables/useStakePreview';

/**
 * TYPES
 */
type Props = {
  isVisible: boolean;
  pool: Pool;
  action: StakeAction;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * STATE
 */
const showFireworks = ref(false);

/**
 * COMPOSABLES
 */
const { setCurrentPool } = usePoolStaking();

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

/**
 * WATCHERS
 */
onMounted(() => {
  setCurrentPool(props.pool.id);
});

watch(
  () => props.pool,
  newPool => {
    setCurrentPool(newPool.id);
  }
);
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
