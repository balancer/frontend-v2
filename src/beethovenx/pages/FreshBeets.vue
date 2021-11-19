<script setup lang="ts">
import { computed } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useFreshBeets } from '@/beethovenx/composables/governance/useFreshBeets';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FreshBeetsBalances from '@/beethovenx/components/pages/fbeets/FreshBeetsBalances.vue';
import FreshBeetsHeader from '@/beethovenx/components/pages/fbeets/FreshBeetsHeader.vue';
import FreshBeetsOldFarmAlert from '@/beethovenx/components/pages/fbeets/FreshBeetsOldFarmAlert.vue';
import FreshBeetsStatCards from '@/beethovenx/components/pages/fbeets/FreshBeetsStatCards.vue';
import usePoolWithFarm from '@/beethovenx/composables/pool/usePoolWithFarm';
import FarmStatCards from '@/beethovenx/components/pages/farm/FarmStatCards.vue';
import FarmStatCardsLoading from '@/beethovenx/components/pages/farm/FarmStatCardsLoading.vue';

const { isWalletReady, appNetworkConfig } = useWeb3();
const {
  fBeetsLoading,
  exchangeRate,
  totalSupply,
  userExchangeAmount,
  approve,
  stake,
  unStake,
  currentExchangeRate,
  userFbeetsBalance,
  userBptTokenBalance
} = useFreshBeets();

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

const hasFbeets = computed(() => {
  //TODO: or has fbeets in the farm
  return hasUnstakedFbeets.value;
});

const fbeetsBalance = computed(() => {
  return fNum(
    scaleDown(new BigNumber(userFbeetsBalance.value.toString()), 18).toString(),
    'token'
  );
});

const hasBpt = computed(() => userBptTokenBalance.value.gt(0));

const { pool, loadingPool } = usePoolWithFarm(appNetworkConfig.fBeets.poolId);
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
        <StepContainer
          :step-number="1"
          title="Invest your BEETS into the Fidelio Duetto pool"
          :complete="hasBpt || hasFbeets"
        >
          <template v-slot:right>
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{
                name: 'invest',
                params: { id: appNetworkConfig.fBeets.poolId }
              }"
              label="Invest BEETS"
            />
          </template>
        </StepContainer>
        <StepContainer
          :step-number="2"
          title="Stake your Fidelio Duetto BPTs and receive fBEETS"
          :complete="hasFbeets"
        >
          <template v-slot:right>
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{ name: 'stake-deposit-withdraw' }"
            >
              Stake BPTs
            </BalBtn>
          </template>
        </StepContainer>
        <StepContainer
          :step-number="3"
          title="Stake your fBEETS into the fBEETS farm"
          :complete="hasFbeets && !hasUnstakedFbeets"
        >
          <template v-slot:right>
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{
                name: 'farm',
                params: {
                  id: appNetworkConfig.fBeets.farmId,
                  tokenAddress: appNetworkConfig.fBeets.address,
                  tokenName: 'fBEETS'
                }
              }"
            >
              Stake fBEETS
            </BalBtn>
          </template>
        </StepContainer>
      </div>
      <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72">
        <FreshBeetsBalances
          :loading="fBeetsLoading"
          :fBeetsBalance="fbeetsBalance"
          :bptBalance="bptBalance"
        />
      </div>
    </div>
  </div>
</template>
