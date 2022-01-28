<script setup lang="ts">
import { ref } from 'vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';

const hidden = ref(false);
</script>

<template>
  <div v-if="!hidden" class="mt-8 border-2 rounded-lg border-red-500 px-4 py-4">
    <div class="flex mb-2">
      <BalIcon name="alert-triangle" size="lg" class="text-red-500" />
      <div class="text-lg font-bold ml-2 text-red-500">Warning</div>
    </div>
    <div>
      The owner of this Liquidity Bootstrapping Pool is
      <span class="font-bold">NOT</span> a Gnosis Safe Multisig Wallet. This
      means that a single person has complete control over the funds in this
      pool. Please proceed with caution.
    </div>
    <div class="flex items-end mt-4">
      <div class="flex-1" />
      <BalBtn size="sm" color="red" @click="hidden = true">I understand</BalBtn>
    </div>
  </div>
</template>
