<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import FarmWithdrawForm from '@/beethovenx/components/pages/farm/FarmWithdrawForm.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';

const { appNetworkConfig } = useWeb3();

const farmUserQuery = useFarmUserQuery(appNetworkConfig.fBeets.oldFarmId);

function handleFarmWithdrawal(txReceipt): void {
  //freshBeetsQuery.refetch.value();
  farmUserQuery.refetch.value();
}
</script>

<template>
  <div class="flex justify-center mb-6">
    <div class="w-full max-w-3xl">
      <BalCard>
        <div class="flex mb-4">
          <BalIcon name="alert-circle" size="xl" class="text-yellow-500" />
          <div class="flex-1 text-black ml-2 text-yellow-500">
            You have Fidelio Duetto BPTs staked in the old farm. Unstake your
            BPTs to get started with fBEETS.
          </div>
        </div>
        <FarmWithdrawForm
          :farm-id="appNetworkConfig.fBeets.oldFarmId"
          :token-address="appNetworkConfig.fBeets.poolAddress"
          @success="handleFarmWithdrawal($event)"
        />
      </BalCard>
    </div>
    <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72" />
  </div>
</template>
