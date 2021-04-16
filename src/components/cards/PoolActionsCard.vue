<template>
  <BalCard noPad>
    <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4" />
    <div>
      <template v-if="activeTab === 'invest'">
        <div v-if="investmentSuccess" class="p-4">
          <h5 v-text="$t('investmentSettled')" />
          <p v-html="$t('investmentSuccess')" />
          <div class="flex mt-4">
            <BalBtn
              tag="a"
              :href="_explorer(networkId, txHash, 'tx')"
              target="_blank"
              rel="noreferrer"
              color="gray"
              size="sm"
              flat
            >
              <span v-text="$t('viewTransaction')" />
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
      <template v-if="activeTab === 'withdraw'">
        <div v-if="withdrawalSuccess" class="p-4">
          <h5 v-text="$t('withdrawalSettled')" />
          <p v-html="$t('withdrawalSuccess')" />
          <div class="flex mt-4">
            <BalBtn
              tag="a"
              :href="_explorer(networkId, txHash, 'tx')"
              target="_blank"
              rel="noreferrer"
              color="gray"
              size="sm"
              flat
            >
              <span v-text="$t('viewTransaction')" />
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
import { computed, defineComponent, ref } from 'vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm.vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

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
    // COMPOSABLES
    const store = useStore();
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

    // COMPUTED
    const networkId = computed(() => store.state.web3.config.chainId);

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
      // computed
      networkId,
      // methods
      handleInvestment,
      handleWithdrawal
    };
  }
});
</script>
