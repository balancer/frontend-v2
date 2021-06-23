<template>
  <BalModal :show="isVisible" @close="$emit('close')">
    <WalletButton v-for="wallet in wallets" :wallet="wallet" :key="wallet" />
  </BalModal>
</template>

<script lang="ts">
import { SupportedWallets } from '@/services/web3/web3.plugin';
import WalletButton from '@/components/web3/WalletButton.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  emits: ['close'],
  components: {
    WalletButton
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      wallets: SupportedWallets
    };
  }
});
</script>
