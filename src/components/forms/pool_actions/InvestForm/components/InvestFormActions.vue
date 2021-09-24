<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';

const { isWalletReady, toggleWalletSelectModal } = useWeb3();
</script>

<template>
  <div>
    <BalBtn
      v-if="!isWalletReady"
      :label="$t('connectWallet')"
      block
      @click.prevent="toggleWalletSelectModal"
    />
  </div>
</template>
