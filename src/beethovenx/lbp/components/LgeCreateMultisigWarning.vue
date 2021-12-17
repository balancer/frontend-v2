<script setup lang="ts">
import { ref, watch } from 'vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useIsGnosisSafeQuery from '@/beethovenx/lbp/composables/useIsGnosisSafeQuery';

const { account } = useWeb3();
const { data } = useIsGnosisSafeQuery(account);

const hidden = ref(true);

watch(data, newVal => {
  if (newVal === false) {
    hidden.value = false;
  }
});
</script>

<template>
  <div
    v-if="!hidden"
    class="mt-8 border-2 rounded-lg border-red-500 px-4 py-4 mb-6"
  >
    <div class="flex mb-2">
      <BalIcon name="alert-triangle" size="lg" class="text-red-500" />
      <div class="text-lg font-bold ml-2 text-red-500">Warning</div>
    </div>
    <p class="mb-4">
      We suggest that you to deploy your LBP using a Gnosis Safe. If you decided
      to deploy with an EOA wallet, an additional warning will appear on your
      LGE page informing the user of the risks. Gnosis provides a convenient
      WalletConnect integration that makes interacting with dApps significantly
      easier.
    </p>
    <div class="flex items-end mt-4">
      <div class="flex-1">
        <a
          href="https://help.gnosis-safe.io/en/articles/4356253-walletconnect-safe-app"
          target="_blank"
          class="text-green-500"
        >
          Learn More
        </a>
      </div>
      <BalBtn size="sm" color="red" @click="hidden = true">I understand</BalBtn>
    </div>
  </div>
</template>
