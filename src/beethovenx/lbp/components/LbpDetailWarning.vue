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
      Participating in a Liquidity Bootstrapping Pool on Beethoven X is a
      high-risk endeavor. The value of the tokens that you receive could go to
      0. Beethoven X is not liable for any losses incurred by using our
      platform. Please be careful and do your own research before participating
      in any event.
    </div>
    <div class="flex items-end mt-4">
      <div class="flex-1">
        <a
          href="https://docs.beethovenx.io/balancer-v2-1/lbps-for-token-launches"
          target="_blank"
          class="text-green-500"
        >
          Read More
        </a>
      </div>
      <BalBtn size="sm" color="red" @click="hidden = true">I understand</BalBtn>
    </div>
  </div>
</template>
