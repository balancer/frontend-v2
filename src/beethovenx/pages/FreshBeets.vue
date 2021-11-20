<script setup lang="ts">
import { computed, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useFreshBeets } from '@/beethovenx/composables/governance/useFreshBeets';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
import FreshBeetsBalances from '@/beethovenx/components/pages/fbeets/FreshBeetsBalances.vue';
import FreshBeetsHeader from '@/beethovenx/components/pages/fbeets/FreshBeetsHeader.vue';
import FreshBeetsOldFarmAlert from '@/beethovenx/components/pages/fbeets/FreshBeetsOldFarmAlert.vue';
import FreshBeetsStatCards from '@/beethovenx/components/pages/fbeets/FreshBeetsStatCards.vue';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';
import FreshBeetsDepositSteps from '@/beethovenx/components/pages/fbeets/FreshBeetsDepositSteps.vue';
import FreshBeetsWithdrawSteps from '@/beethovenx/components/pages/fbeets/FreshBeetsWithdrawSteps.vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';

const { appNetworkConfig } = useWeb3();
const {
  fBeetsLoading,
  userFbeetsBalance,
  userBptTokenBalance
} = useFreshBeets();
const { balanceFor } = useTokens();

const farmUserQuery = useFarmUserQuery(appNetworkConfig.fBeets.farmId);
const farmUser = computed(() => {
  return farmUserQuery.data.value;
});
const fbeetsDeposited = computed(() => {
  const amount = farmUser.value?.amount;

  return amount ? scaleDown(new BigNumber(amount), 18) : new BigNumber(0);
});

const bptBalance = computed(() => {
  return fNum(
    scaleDown(
      new BigNumber(userBptTokenBalance.value.toString()),
      18
    ).toString(),
    'token'
  );
});

const hasUnstakedFbeets = computed(() => userFbeetsBalance.value.gt(0));

const fbeetsBalance = computed(() => {
  const unstakedFbeets = scaleDown(
    new BigNumber(userFbeetsBalance.value.toString()),
    18
  );

  return fNum(unstakedFbeets.plus(fbeetsDeposited.value).toString(), 'token');
});

const hasBpt = computed(() => userBptTokenBalance.value.gt(0));

const beetsBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.beets)), 'token')
);

const tabs = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <FreshBeetsHeader />
    <FreshBeetsOldFarmAlert />

    <div class="flex justify-center mb-8">
      <div class="w-full max-w-3xl">
        <FreshBeetsStatCards />
        <!--        <FarmStatCardsLoading v-if="loadingPool || !pool" />
        <FarmStatCards v-else :farm="pool.farm" :token-address="pool.address" />-->

        <div class="mb-4">
          <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
        </div>
        <FreshBeetsDepositSteps
          v-if="activeTab === 'deposit'"
          :hasBpt="hasBpt"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :hasStakedFbeets="fbeetsDeposited.gt(0)"
        />
        <FreshBeetsWithdrawSteps
          v-if="activeTab === 'withdraw'"
          :hasBpt="hasBpt"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :hasStakedFbeets="fbeetsDeposited.gt(0)"
        />
      </div>
      <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72">
        <FreshBeetsBalances
          :loading="fBeetsLoading"
          :f-beets-balance="fbeetsBalance"
          :bpt-balance="bptBalance"
          :beets-balance="beetsBalance"
        />
      </div>
    </div>
  </div>
</template>
