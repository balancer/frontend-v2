<template>
  <BalCard noPad>
    <div class="relative overflow-hidden">
      <div
        class="flex justify-between items-end border-b dark:border-gray-900 px-4"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 -mb-px" no-pad />
        <TradeSettingsPopover :context="TradeSettingsContext.invest" />
      </div>

      <template v-if="activeTab === 'invest'">
        <InvestForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleInvestment($event)"
        />
        <SuccessOverlay
          v-if="investmentSuccess"
          :title="$t('investmentSettled')"
          :description="$t('investmentSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="investmentSuccess = false"
        />
      </template>
      <template v-if="activeTab === 'withdraw'">
        <WithdrawForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleWithdrawal($event)"
        />
        <SuccessOverlay
          v-if="withdrawalSuccess"
          :title="$t('withdrawalSettled')"
          :description="$t('withdrawalSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
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
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import { useI18n } from 'vue-i18n';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';

export default defineComponent({
  name: 'PoolActionsCard',

  emits: ['onTx'],

  components: {
    InvestForm,
    WithdrawForm,
    SuccessOverlay,
    TradeSettingsPopover
  },

  props: {
    pool: { type: Object, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(_, { emit }) {
    // COMPOSABLES
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { explorerLinks: explorer } = useWeb3();

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
      trackGoal(Goals.Invested);
      emit('onTx', txReceipt);
    }

    function handleWithdrawal(txReceipt): void {
      withdrawalSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Withdrawal);
      emit('onTx', txReceipt);
    }

    return {
      // data
      activeTab,
      tabs,
      investmentSuccess,
      withdrawalSuccess,
      txHash,
      TradeSettingsContext,
      // methods
      handleInvestment,
      handleWithdrawal,
      explorer
    };
  }
});
</script>
