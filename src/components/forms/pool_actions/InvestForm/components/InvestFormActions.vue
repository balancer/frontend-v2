<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  hasAmounts: boolean;
  hasValidInputs: boolean;
};

/**
 * PROPS & EMITS
 */
defineProps<Props>();

const emit = defineEmits<{
  (e: 'preview'): void;
}>();

/**
 * COMPOSABLES
 */
const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();
</script>

<template>
  <div>
    <BalBtn
      v-if="!isWalletReady"
      :label="$t('connectWallet')"
      block
      @click.prevent="toggleWalletSelectModal"
    />
    <BalBtn
      v-else
      :label="$t('preview')"
      color="gradient"
      :disabled="!hasAmounts || !hasValidInputs || isMismatchedNetwork"
      block
      @click.prevent="emit('preview')"
    />
  </div>
</template>
