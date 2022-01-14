<script setup lang="ts">
import { configService } from '@/services/config/config.service';
import FarmDepositForm from '@/beethovenx/components/pages/farm/FarmDepositForm.vue';
import FarmWithdrawForm from '@/beethovenx/components/pages/farm/FarmWithdrawForm.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { PoolTransactionsTab } from '@/components/contextual/pages/pool/PoolTransactionsCard/types';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';

type Props = {
  tokenAddress: string;
  farmId: string;
  hasUnstakedBpt: boolean;
  hasFarmRewards: boolean;
};

const props = defineProps<Props>();

/**
 * STATE
 */
const { network } = configService;
const { explorerLinks: explorer, appNetworkConfig } = useWeb3();
const route = useRoute();

const { loading, injectTokens, dynamicDataLoading } = useTokens();

const farmInvestmentSuccess = ref(false);
const farmWithdrawalSuccess = ref(false);
const txHash = ref('');

const isOldFbeetsFarm = computed(
  () => props.farmId === appNetworkConfig.fBeets.farmId
);

function handleFarmInvestment(txReceipt): void {
  farmInvestmentSuccess.value = true;
  txHash.value = txReceipt.hash;
}

function handleFarmWithdrawal(txReceipt): void {
  farmWithdrawalSuccess.value = true;
  txHash.value = txReceipt.hash;
}

const tabs = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div class="mt-4 relative">
    <BalAlert
      v-if="!loading && props.hasUnstakedBpt && !isOldFbeetsFarm"
      title="You have unstaked BPT in your wallet"
      description="If you deposit your BPT into the farm, you will earn additional rewards paid out in BEETS."
      type="warning"
      size="sm"
      class="mb-3"
    />
    <BalAlert
      v-if="!loading && isOldFbeetsFarm"
      title="Incentives for the Fidelio Duetto have moved to fBEETS"
      description="To receive BEETS rewards for this pool, you need to stake your BPT for fBEETS. Click on the 'Stake' tab to get started."
      type="warning"
      size="sm"
      class="mb-3"
    />
    <BalLoadingBlock v-if="loading || dynamicDataLoading" class="h-96" />
    <BalCard v-else-if="!isOldFbeetsFarm">
      <div class="text-gray-500 text-sm">
        Stake your BPTs to earn BEETS
      </div>
      <h5 class="mb-1">Farm</h5>

      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
      <div v-if="activeTab === 'deposit'" class="mt-4">
        <FarmDepositForm
          :token-address="props.tokenAddress"
          :farm-id="props.farmId"
          @success="handleFarmInvestment($event)"
        />
      </div>
      <SuccessOverlay
        v-if="farmInvestmentSuccess"
        :title="$t('farmDepositSettled')"
        :description="$t('farmDepositSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmInvestmentSuccess = false"
        class="h-96"
      />
      <div v-if="activeTab === 'withdraw'" class="mt-4">
        <FarmWithdrawForm
          :token-address="props.tokenAddress"
          :farm-id="props.farmId"
          @success="handleFarmWithdrawal($event)"
        />
      </div>
      <SuccessOverlay
        v-if="farmWithdrawalSuccess"
        :title="$t('farmWithdrawalSettled')"
        :description="$t('farmWithdrawalSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmWithdrawalSuccess = false"
      />
    </BalCard>
  </div>
</template>
