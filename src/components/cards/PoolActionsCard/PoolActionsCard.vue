<template>
  <BalCard noPad>
    <div class="relative overflow-hidden">
      <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4" />
      <template v-if="activeTab === 'invest'">
        <InvestForm :pool="pool" @success="handleInvestment($event)" />
        <SuccessOverlay
          v-if="investmentSuccess"
          :title="$t('investmentSettled')"
          :description="$t('investmentSuccess')"
          :closeLabel="$t('close')"
          :txHash="txHash"
          @close="investmentSuccess = false"
        />
      </template>
      <template v-if="activeTab === 'withdraw'">
        <WithdrawForm :pool="pool" @success="handleWithdrawal($event)" />
        <SuccessOverlay
          v-if="withdrawalSuccess"
          :title="$t('withdrawalSettled')"
          :description="$t('withdrawalSuccess')"
          :closeLabel="$t('newTrade')"
          :txHash="txHash"
          @close="withdrawalSuccess = false"
        />
      </template>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm.vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';
import SuccessOverlay from './SuccessOverlay.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'PoolActionsCard',

  emits: ['onTx'],

  components: {
    InvestForm,
    WithdrawForm,
    SuccessOverlay
  },

  props: {
    pool: { type: Object, required: true }
  },

  setup(_, { emit }) {
    // COMPOSABLES
    const { t } = useI18n();

    // DATA
    const tabs = [
      { value: 'invest', label: t('invest') },
      { value: 'withdraw', label: t('withdraw') }
    ];
    const activeTab = ref(tabs[0].value);
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const txHash = ref('');

    // METHODS
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
      // data
      activeTab,
      tabs,
      investmentSuccess,
      withdrawalSuccess,
      txHash,
      // methods
      handleInvestment,
      handleWithdrawal
    };
  }
});
</script>
