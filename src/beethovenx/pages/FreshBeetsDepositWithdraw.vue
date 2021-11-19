<script setup lang="ts">
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import useTokens from '@/composables/useTokens';
import FreshBeetsDepositForm from '@/beethovenx/components/pages/fbeets/FreshBeetsDepositForm.vue';
import FreshBeetsWithdrawForm from '@/beethovenx/components/pages/fbeets/FreshBeetsWithdrawForm.vue';

/**
 * STATE
 */
const { network } = configService;
const { explorerLinks: explorer } = useWeb3();
const route = useRoute();

const { loading, injectTokens, dynamicDataLoading } = useTokens();

const farmInvestmentSuccess = ref(false);
const farmWithdrawalSuccess = ref(false);
const txHash = ref('');

function handleFarmInvestment(txReceipt): void {
  farmInvestmentSuccess.value = true;
  txHash.value = txReceipt.hash;
}

function handleFarmWithdrawal(txReceipt): void {
  farmWithdrawalSuccess.value = true;
  txHash.value = txReceipt.hash;
}

onMounted(() => {
  injectTokens([route.params.tokenAddress as string]);
});
</script>

<template>
  <div>
    <BalLoadingBlock v-if="loading || dynamicDataLoading" class="h-96" />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="flex items-center justify-between">
            <h4>Mint fBEETS</h4>
          </div>
        </div>
      </template>
      <FreshBeetsDepositForm @success="handleFarmInvestment($event)" />
      <!--      <SuccessOverlay
        v-if="true"
        :title="$t('farmDepositSettled')"
        :description="$t('farmDepositSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmInvestmentSuccess = false"
        class="h-96"
      />-->
      <h4 class="mt-6">Burn fBEETS</h4>
      <FreshBeetsWithdrawForm @success="handleFarmWithdrawal($event)" />
      <!--      <SuccessOverlay
        v-if="farmWithdrawalSuccess"
        :title="$t('farmWithdrawalSettled')"
        :description="$t('farmWithdrawalSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmWithdrawalSuccess = false"
      />-->
    </BalCard>
  </div>
</template>
