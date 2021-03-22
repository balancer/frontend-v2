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
      <template v-if="isActiveTab('invest')">
        <div v-if="investmentSuccess">
          <h5>Your investment has settled</h5>
          <p>
            Your tokens have been added to this pool, and you should have
            received a new LP token representing this investment.
          </p>
          <div class="flex mt-4">
            <BalBtn
              tag="a"
              :href="_explorer(web3.config.chainId, txHash, 'tx')"
              target="_blank"
              rel="noreferrer"
              color="gray"
              size="sm"
              flat
            >
              <span>View transaction</span>
              <BalIcon name="external-link" size="sm" class="ml-2" />
            </BalBtn>
            <BalBtn
              label="Close"
              color="gray"
              size="sm"
              class="ml-4"
              flat
              @click="investmentSuccess = false"
            />
          </div>
        </div>
        <InvestForm v-else :pool="pool" @success="handleInvestment($event)" />
      </template>
      <template v-if="isActiveTab('withdraw')">
        <div v-if="withdrawalSuccess">
          <h5>Your withdrawal has settled</h5>
          <p>
            Your investment has been withdrawan from this pool, and the
            underlying tokens should now be in your wallet.
          </p>
          <div class="flex mt-4">
            <BalBtn
              tag="a"
              :href="_explorer(web3.config.chainId, txHash, 'tx')"
              target="_blank"
              rel="noreferrer"
              color="gray"
              size="sm"
              flat
            >
              <span>View transaction</span>
              <BalIcon name="external-link" size="sm" class="ml-2" />
            </BalBtn>
            <BalBtn
              label="Close"
              color="gray"
              size="sm"
              class="ml-4"
              flat
              @click="withdrawalSuccess = false"
            />
          </div>
        </div>
        <WithdrawForm v-else :pool="pool" @success="handleWithdrawal($event)" />
      </template>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import InvestForm from '@/components/forms/InvestForm.vue';
import WithdrawForm from '@/components/forms/WithdrawForm.vue';

export default defineComponent({
  name: 'PoolActionsCard',

  emits: ['onTx'],

  components: {
    InvestForm,
    WithdrawForm
  },

  props: {
    pool: { type: Object, required: true }
  },

  setup(_, { emit }) {
    const activeTab = ref('invest');
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const txHash = ref('');

    function isActiveTab(tab) {
      return activeTab.value === tab;
    }

    function activeClasses(tab) {
      return {
        'border-black text-black font-bold': isActiveTab(tab)
      };
    }

    function handleInvestment(txReceipt): void {
      investmentSuccess.value = true;
      txHash.value = txReceipt.hash;
      emit('onTx', txReceipt);
    }

    function handleWithdrawal(txReceipt): void {
      withdrawalSuccess.value = true;
      txHash.value = txReceipt.hash;
      emit('onTx', txReceipt);
    }

    return {
      activeTab,
      isActiveTab,
      activeClasses,

      handleInvestment,
      handleWithdrawal,
      investmentSuccess,
      withdrawalSuccess,
      txHash
    };
  }
});
</script>

<style>
.tab {
  @apply border-b -mb-px mr-4 py-3 cursor-pointer hover:text-black;
}
</style>
