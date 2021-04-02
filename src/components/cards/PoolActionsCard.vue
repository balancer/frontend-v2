<template>
  <BalCard noPad>
    <BalTabs v-model="activeTab" :tabs="Object.values(Tabs)" class="pt-4" />
    <div>
      <template v-if="activeTab === Tabs.invest">
        <div v-if="investmentSuccess" class="p-4">
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
      <template v-if="activeTab === Tabs.withdraw">
        <div v-if="withdrawalSuccess" class="p-4">
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
import InvestForm from '@/components/forms/pool_actions/InvestForm.vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';

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
    enum Tabs {
      invest = 'Invest',
      withdraw = 'Withdraw'
    }

    const activeTab = ref(Tabs.invest);
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const txHash = ref('');

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
      Tabs,

      handleInvestment,
      handleWithdrawal,
      investmentSuccess,
      withdrawalSuccess,
      txHash
    };
  }
});
</script>
