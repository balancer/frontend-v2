<template>
  <BalModal :show="isVisible">
    <WalletButton v-for="wallet in wallets" :wallet="wallet" :key="wallet" />
  </BalModal>
</template>

<script lang="ts">
import { SupportedWallets } from '../web3.plugin';
import WalletButton from './WalletButton.vue';
import { defineComponent } from 'vue';
export default defineComponent({
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
