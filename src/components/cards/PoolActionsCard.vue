<template>
  <BalCard noPad>
    <div class="pl-4 pt-4 pb-2">
      <div class="flex border-b font-medium text-gray-500">
        <div
          :class="['tab', activeClasses('invest')]"
          @click="activeTab = 'invest'"
        >
          Invest
        </div>
        <div
          :class="['tab', activeClasses('withdraw')]"
          @click="activeTab = 'withdraw'"
        >
          Withdraw
        </div>
      </div>
    </div>
    <div class="p-4">
      <InvestForm
        v-if="isActiveTab('invest')"
        :pool="pool"
        @on-tx="$emit('onTx', $event)"
      />
      <WithdrawForm
        v-if="isActiveTab('withdraw')"
        :pool="pool"
        @on-tx="$emit('onTx', $event)"
      />
    </div>
  </BalCard>
</template>

<script>
import { defineComponent, ref } from 'vue';
import InvestForm from '@/components/forms/InvestForm.vue';
import WithdrawForm from '@/components/forms/WithdrawForm.vue';

export default defineComponent({
  name: 'PoolActionsCard',

  components: {
    InvestForm,
    WithdrawForm
  },

  props: {
    pool: { type: Object, required: true }
  },

  setup() {
    const activeTab = ref('invest');

    function isActiveTab(tab) {
      return activeTab.value === tab;
    }

    function activeClasses(tab) {
      return {
        'border-black text-black font-bold': isActiveTab(tab)
      };
    }

    return { activeTab, isActiveTab, activeClasses };
  }
});
</script>

<style>
.tab {
  @apply border-b -mb-px mr-4 py-3 cursor-pointer hover:text-black;
}
</style>
