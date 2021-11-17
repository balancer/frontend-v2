<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <div class="flex justify-center mb-8">
      <div class="flex flex-col w-full max-w-xl mt-auto mb-2">
        <h2 class="text-green-500">
          Maximize your Yield
        </h2>
        <h2 class="text-lg font-light mb-4">
          Stake your Fidelio Duetto BPTs for fBEETS
        </h2>
        <p>
          30% of Beethoven X protocol revenue is used to reward fBEETS holders.
          When your Fidelio Duetto BPTs are staked, you recieve fBEETS in return
          for voting rights and a fully composable token that can interact with
          other protocols. Your fBEETS are continuously compounding. When you
          unstake, you will receive all the originally deposited Fidelio Duetto
          BPTs plus any additional from fees.
        </p>
        <!--        <BalLoadingBlock v-if="false" class="h-10 w-40" />-->
      </div>
      <div class="hidden pl-8 ml-6 md:block w-72">
        <img src="~@/beethovenx/assets/images/BEETX-fBEET-3D2x.png" />
      </div>
    </div>
    <div class="flex flex-col justify-center md:flex-row">
      <div class="flex flex-col w-full max-w-xl mx-auto mb-4 md:m-0">
        <BalCard shadow="xl" class="mb-4">
          <div class="flex">
            <div class="flex-1">
              <h4>Staking APR</h4>
              <BalLoadingBlock
                v-if="fBeetsLoading"
                class="h-6 w-56 mb-1"
                white
              />
              <p v-else class="text-green-500 font-medium">
                1 fBEETS = {{ fNum(currentExchangeRate, 'token') }} Fidelio
                Duetto BPT
              </p>
            </div>
            <div>
              <h4 class="text-green-500 text-3xl text-right">9.83%</h4>
              <p class="text-right">Year to date</p>
            </div>
          </div>
        </BalCard>
        <BalCard shadow="xl" exposeOverflow noBorder>
          <h4>Stake</h4>
          <FreshBeetsDepositForm />
          <!--      <SuccessOverlay
            v-if="true"
            :title="$t('farmDepositSettled')"
            :description="$t('farmDepositSuccess')"
            :closeLabel="$t('close')"
            :explorerLink="explorer.txLink(txHash)"
            @close="farmInvestmentSuccess = false"
            class="h-96"
          />-->

          <h4 class="mt-6">Unstake</h4>
          <FreshBeetsWithdrawForm />
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
      <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72">
        <BalCard shadow="xl" class="mb-4 py-2">
          <div class="flex flex-col flex-grow md:mb-10">
            <h4 class="mb-3">Balance</h4>
            <div class="flex items-center space-x-4">
              <img src="~@/beethovenx/assets/images/fBEETS.png" width="64" />
              <div class="flex flex-col justify-center">
                <BalLoadingBlock
                  v-if="fBeetsLoading"
                  class="h-6 w-24 mb-1"
                  white
                />
                <p v-else class="text-sm font-bold md:text-lg">
                  {{ fbeetsBalance }}
                </p>
                <p class="text-sm md:text-base text-primary">fBEETS</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col flex-grow">
            <h4 class="mb-3">Unstaked</h4>
            <div class="flex items-center space-x-4">
              <img
                src="~@/beethovenx/assets/images/fidellio-duetto-bpt.png"
                width="64"
              />
              <div class="flex flex-col justify-center">
                <BalLoadingBlock
                  v-if="fBeetsLoading"
                  class="h-6 w-24 mb-1"
                  white
                />
                <p v-else class="text-sm font-bold md:text-lg">
                  {{ bptBalance }}
                </p>
                <p class="text-sm md:text-base text-primary">
                  Fidelio Duetto BPTs
                </p>
              </div>
            </div>
          </div>
        </BalCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useFreshBeets } from '@/beethovenx/composables/governance/useFreshBeets';
import { fp } from '@/beethovenx/utils/numbers';
import FreshBeetsDepositForm from '@/beethovenx/components/pages/fbeets/FreshBeetsDepositForm.vue';
import FreshBeetsWithdrawForm from '@/beethovenx/components/pages/fbeets/FreshBeetsWithdrawForm.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';

export default defineComponent({
  components: {
    BalCard,
    FreshBeetsDepositForm,
    FreshBeetsWithdrawForm
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
