<template>
  <BalCard noPad>
    <div class="pl-4 pt-4 pb-2">
      <div class="flex border-b font-medium text-gray-500">
        <div
          class="border-b border-black -mb-px py-3 text-black font-bold cursor-pointer"
        >
          Invest
        </div>
        <div
          class="border-b -mb-px ml-4 py-3 px-2 cursor-pointer hover:text-black"
        >
          Withdraw
        </div>
      </div>
    </div>
    <div class="p-4">
      <InvestForm :pool="pool" />
    </div>
  </BalCard>
</template>

<script>
import { defineComponent } from 'vue';
import InvestForm from '@/components/forms/InvestForm.vue';

export default defineComponent({
  name: 'PoolActionsCard',

  components: {
    InvestForm
  },

  props: {
    pool: { type: Object, required: true }
  }
});
</script>
