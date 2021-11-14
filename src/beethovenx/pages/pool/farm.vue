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

/**
 * STATE
 */
const { network } = configService;
const { explorerLinks: explorer } = useWeb3();
const route = useRoute();
const {
  poolsWithFarms,
  userPools,
  isLoadingUserPools,
  isLoadingFarms,
  isLoadingPools
} = usePools();

const poolQuery = usePoolQuery(route.params.id as string);
const farmInvestmentSuccess = ref(false);
const farmWithdrawalSuccess = ref(false);
const txHash = ref('');

const loadingPool = computed(
  () =>
    isLoadingUserPools.value ||
    isLoadingPools.value ||
    isLoadingFarms.value ||
    poolQuery.isLoading.value
);

const pool = computed(() => {
  const poolWithFarm = poolsWithFarms.value.find(
    poolWithFarm => poolWithFarm.id === (route.params.id as string)
  );
  const userPool = userPools.value.find(
    poolWithFarm => poolWithFarm.id === (route.params.id as string)
  );

  if (!poolQuery.data.value) {
    return undefined;
  }

  return {
    ...poolQuery.data.value,
    dynamic: poolWithFarm ? poolWithFarm.dynamic : poolQuery.data.value.dynamic,
    hasLiquidityMiningRewards: !!poolWithFarm,
    farm: poolWithFarm?.farm,
    shares: userPool?.shares
  };
});

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
    <BalLoadingBlock v-if="loadingPool" class="h-96" />
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
      <FarmDepositForm :pool="pool" @success="handleFarmInvestment($event)" />
      <!--      <SuccessOverlay
        v-if="true"
        :title="$t('farmDepositSettled')"
        :description="$t('farmDepositSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="farmInvestmentSuccess = false"
        class="h-96"
      />-->
      <FarmWithdrawForm :pool="pool" @success="handleFarmWithdrawal($event)" />
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
