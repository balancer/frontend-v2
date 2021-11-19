<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <FreshBeetsHeader />
    <FreshBeetsOldFarmAlert />

    <div class="flex justify-center mb-8">
      <div class="w-full max-w-3xl">
        <FreshBeetsStatCards />
        <StepContainer
          :step-number="1"
          title="Invest your BEETS into the Fidelio Duetto pool"
          :complete="false"
        >
          <template v-slot:right>
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{
                name: 'invest',
                params: {
                  id:
                    '0x33276d43ada054a281d40a11d48310cdc0156fc2000200000000000000000001'
                }
              }"
              label="Invest BEETS"
            />
          </template>
        </StepContainer>
        <StepContainer
          :step-number="2"
          title="Stake your Fidelio Duetto BPTs and receive fBEETS"
          :complete="false"
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
          :complete="false"
        >
          <template v-slot:right>
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{
                name: 'farm',
                params: {
                  id: '3',
                  tokenAddress: '0x33276d43ada054a281d40a11d48310cdc0156fc2',
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
          fBeetsBalance="123.2"
          bptBalance="202.1"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useFreshBeets } from '@/beethovenx/composables/governance/useFreshBeets';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FreshBeetsBalances from '@/beethovenx/components/pages/fbeets/FreshBeetsBalances.vue';
import FreshBeetsHeader from '@/beethovenx/components/pages/fbeets/FreshBeetsHeader.vue';
import FreshBeetsOldFarmAlert from '@/beethovenx/components/pages/fbeets/FreshBeetsOldFarmAlert.vue';
import FreshBeetsStatCards from '@/beethovenx/components/pages/fbeets/FreshBeetsStatCards.vue';

export default defineComponent({
  components: {
    FreshBeetsStatCards,
    FreshBeetsOldFarmAlert,
    FreshBeetsHeader,
    FreshBeetsBalances,
    BalBtn,
    StepContainer
    //FreshBeetsDepositForm,
    //FreshBeetsWithdrawForm
  },

  setup() {
    const { isWalletReady } = useWeb3();
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

    const fbeetsBalance = computed(() => {
      return fNum(
        scaleDown(
          new BigNumber(userFbeetsBalance.value.toString()),
          18
        ).toString(),
        'token'
      );
    });

    return {
      fNum,
      fBeetsLoading,
      exchangeRate,
      totalSupply,
      userExchangeAmount,
      approve,
      stake,
      unStake,
      currentExchangeRate,
      userFbeetsBalance,
      userBptTokenBalance,
      bptBalance,
      fbeetsBalance
    };
  }
});
</script>

<style scoped>
.pool-title {
  @apply mr-4 capitalize mt-2;
  font-variation-settings: 'wght' 700;
}
</style>
