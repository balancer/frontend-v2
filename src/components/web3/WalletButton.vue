<template>
  <button class="wallet-connect-btn" @click="handleClick">
    <div class="flex items-center" style="width: 70%">
      <img
        :src="require(`@/assets/images/connectors/${wallet}.svg`)"
        class="mr-4 w-10 h-10"
      />
      <h5 class="text-base text-gray-700 dark:text-white">
        <span class="capitalize">{{ WalletNameMap[wallet] }}</span>
      </h5>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import useWeb3 from '@/services/web3/useWeb3';
import { Wallet, WalletNameMap } from '@/services/web3/web3.plugin';
export default defineComponent({
  props: {
    wallet: {
      type: String as PropType<Wallet>,
      required: true,
    },
  },
  setup(props) {
    const { connectWallet, toggleWalletSelectModal } = useWeb3();
    function handleClick() {
      connectWallet(props.wallet);
      toggleWalletSelectModal(false);
    }
    return {
      WalletNameMap,
      handleClick,
    };
  },
});
</script>

<style>
.wallet-connect-btn {
  @apply transition-all;
  @apply bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800;
  @apply border dark:border-gray-900;
  @apply p-4 flex justify-start items-center w-full h-14 rounded-md mb-3 shadow-lg;
}
</style>
