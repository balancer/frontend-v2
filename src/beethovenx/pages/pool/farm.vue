<script setup lang="ts">
import { configService } from '@/services/config/config.service';
// Composables
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
// Components
import FarmDepositForm from '@/beethovenx/components/pages/farm/FarmDepositForm.vue';
import FarmWithdrawForm from '@/beethovenx/components/pages/farm/FarmWithdrawForm.vue';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useRoute } from 'vue-router';
import usePools from '@/composables/pools/usePools';
import { computed, ref } from 'vue';
import useTokens from '@/composables/useTokens';

/**
 * STATE
 */
const { network } = configService;
const { explorerLinks: explorer } = useWeb3();
const route = useRoute();

const { loading: loadingTokens } = useTokens();

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
</script>

<template>
  <div>
    <BalLoadingBlock v-if="loadingTokens" class="h-96" />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs text-gray-500 leading-none">
            {{ network.chainName }}
          </div>
          <div class="flex items-center justify-between">
            <h4>Farm</h4>
          </div>
        </div>
      </template>
      <FarmDepositForm
        :token-address="route.params.tokenAddress"
        :farm-id="route.params.id"
        @success="handleFarmInvestment($event)"
      />
      <!--      <SuccessOverlay
        v-if="true"
        :title="$t('farmDepositSettled')"
        :description="$t('farmDepositSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmInvestmentSuccess = false"
        class="h-96"
      />-->
      <FarmWithdrawForm
        :token-address="route.params.tokenAddress"
        :farm-id="route.params.id"
        @success="handleFarmWithdrawal($event)"
      />
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
