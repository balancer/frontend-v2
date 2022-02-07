<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';
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
import useFarmUser from '@/beethovenx/composables/farms/useFarmUser';
import usePoolWithFarm from '@/beethovenx/composables/pool/usePoolWithFarm';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';

const { appNetworkConfig, isLoadingProfile } = useWeb3();
const {
  fBeetsLoading,
  userFbeetsBalance,
  userBptTokenBalance,
  userUnstakedFbeetsBalance
} = useFreshBeets();
const {
  balanceFor,
  injectTokens,
  dynamicDataLoading,
  loading: tokensLoading
} = useTokens();

const { farmUser, farmUserLoading } = useFarmUser(
  appNetworkConfig.fBeets.farmId
);
const { pool, loadingPool } = usePoolWithFarm(appNetworkConfig.fBeets.poolId);
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

const hasUnstakedFbeets = computed(() => userUnstakedFbeetsBalance.value.gt(0));
const hasBpt = computed(() => userBptTokenBalance.value.gt(0));

const beetsBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.beets)), 'token')
);

const oldFarmUserQuery = useFarmUserQuery(appNetworkConfig.fBeets.oldFarmId);
const oldFarmUser = computed(() => {
  return oldFarmUserQuery.data.value;
});

onMounted(() => {
  injectTokens([
    appNetworkConfig.fBeets.poolAddress,
    appNetworkConfig.fBeets.address
  ]);
});

const dataLoading = computed(
  () =>
    fBeetsLoading.value ||
    farmUserLoading.value ||
    tokensLoading.value ||
    dynamicDataLoading.value
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
    <FreshBeetsOldFarmAlert v-if="oldFarmUser && oldFarmUser.amount > 0" />

    <div class="flex justify-center">
      <div class="w-full max-w-3xl">
        <BalAlert
          v-if="userBptTokenBalance.gt(0)"
          title="You have unstaked BPT in your wallet"
          description="If you stake your BPT, you will receive fBEETS and be eligible to earn a portion of Beethoven X Protocol Revenue."
          type="warning"
          size="md"
          class="mb-4"
        />
        <BalAlert
          v-if="userBptTokenBalance.eq(0) && userUnstakedFbeetsBalance.gt(0)"
          title="You have unstaked fBEETS in your wallet"
          description="If you deposit your fBEETS into the farm, you will earn additional rewards."
          type="warning"
          size="md"
          class="mb-4"
        />
      </div>
      <div
        class="hidden w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72"
      />
    </div>

    <div class="lg:flex justify-center mb-8">
      <div class="w-full lg:max-w-3xl">
        <div class="mb-6">
          <FreshBeetsStatCards />
        </div>
        <div class="mb-4">
          <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
        </div>
        <FreshBeetsDepositSteps
          v-if="activeTab === 'deposit'"
          :hasBpt="hasBpt"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :hasStakedFbeets="fbeetsDeposited.gt(0)"
          :loading="dataLoading"
        />
        <FreshBeetsWithdrawSteps
          v-if="activeTab === 'withdraw'"
          :hasBpt="hasBpt"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :hasStakedFbeets="fbeetsDeposited.gt(0)"
          :loading="dataLoading"
        />
      </div>
      <div class="w-full lg:max-w-xl mx-auto md:mx-0 lg:ml-6 md:block lg:w-72">
        <FreshBeetsBalances
          :loading="dataLoading"
          :f-beets-balance="userFbeetsBalance"
          :bpt-balance="bptBalance"
          :beets-balance="beetsBalance"
        />
      </div>
    </div>
  </div>
</template>
