<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <div class="flex justify-center mb-8">
      <div class="flex flex-col w-full max-w-3xl mt-auto mb-2">
        <h2 class="text-green-500">
          Maximize your Yield
        </h2>
        <h2 class="text-lg font-light mb-4">
          Stake your Fidelio Duetto BPTs for fBEETS
        </h2>
        <p>
          30% of Beethoven X protocol revenue is used to reward fBEETS holders.
          When you stake your Fidelio Duetto BPTs, you receive fBEETS in return.
          fBEETS holders earn triple yield:
        </p>
        <ul class="list-disc list-inside ml-2 mt-2">
          <li>Swap fees earned as a Liquidity Provider (LP)</li>
          <li>Farm incentives</li>
          <li>Protocol revenue</li>
        </ul>
        <!--        <BalLoadingBlock v-if="false" class="h-10 w-40" />-->
      </div>
      <div class="hidden pl-8 ml-6 md:block">
        <img
          src="~@/beethovenx/assets/images/BEETX-fBEET-3D2x.png"
          style="width: 256px; max-width: 256px;"
        />
      </div>
    </div>
    <div class="flex justify-center mb-8">
      <div class="w-full max-w-3xl">
        <BalCard bg-color="bg-yellow-500 mb-4">
          <div class="flex">
            <BalIcon name="alert-circle" size="xl" class="text-black" />
            <div class="flex-1 text-black mr-8 ml-2">
              You have Fidelio Duetto BPTs staked in the old farm. Unstake your
              BPTs to get started with fBEETS.
            </div>
            <BalBtn class="w-40">
              Unstake BPTs
            </BalBtn>
          </div>
        </BalCard>
      </div>
      <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72" />
    </div>
    <div class="flex justify-center mb-8">
      <div class="w-full max-w-3xl">
        <div
          class="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols3 gap-4 w-full max-w-3xl mb-4"
        >
          <BalCard>
            <div class="text-sm text-gray-500 font-medium mb-2">
              BPT Staked
            </div>
            <div class="text-xl font-medium truncate flex items-center">
              23%
            </div>
          </BalCard>
          <BalCard>
            <div class="text-sm text-gray-500 font-medium mb-2">
              BEETS Staked
            </div>
            <div class="text-xl font-medium truncate flex items-center">
              23%
            </div>
          </BalCard>
          <BalCard>
            <div class="text-sm text-gray-500 font-medium mb-2">
              fBEETS APR
            </div>
            <div class="text-xl font-medium truncate flex items-center">
              320%
              <FreshBeetsAprTooltip
                :swap-apr="20"
                :farm-apr="20"
                :fbeets-apr="20"
              />
            </div>
          </BalCard>
        </div>
        <!--        <BalCard shadow="xl" class="mb-4">
          <div class="flex">
            <div class="flex-1">
              <h4>fBEETS APR</h4>
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
              <h4 class="text-3xl text-right">
                322.10%
                <FreshBeetsAprTooltip
                  :swap-apr="20"
                  :farm-apr="20"
                  :fbeets-apr="20"
                />
              </h4>
            </div>
          </div>
        </BalCard>-->

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
            <!--
            <BalBtn
      v-if="hasFarm"
      class="mt-2"
      :tag="hasFarmStake || hasUnstakedBpt ? 'router-link' : 'div'"
      :to="{ name: 'farm' }"
      label="Farm"
      :disabled="!hasFarmStake && !hasUnstakedBpt"
      block
    />
            -->
            <BalBtn
              class="w-40"
              tag="router-link"
              :to="{
                name: 'farm',
                params: {
                  id: '3',
                  tokenAddress: '0x33276d43ada054a281d40a11d48310cdc0156fc2'
                }
              }"
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
                  tokenAddress: '0x33276d43ada054a281d40a11d48310cdc0156fc2'
                }
              }"
            >
              Stake fBEETS
            </BalBtn>
          </template>
        </StepContainer>
      </div>
      <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72">
        <BalCard shadow="xl" class="mb-4 pb-1">
          <div class="flex flex-col flex-grow md:mb-10">
            <h4 class="mb-3">My Balance</h4>
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
          <div class="flex flex-col flex-grow md:mb-10">
            <h4 class="mb-3">My Unstaked BPTs</h4>
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
          <div class="flex flex-col flex-grow">
            <h4 class="mb-3">My Uninvested BEETS</h4>
            <div class="flex items-center space-x-4">
              <img
                src="~@/beethovenx/assets/images/beets-icon-large.png"
                width="64"
              />
              <div class="flex flex-col justify-center">
                <BalLoadingBlock
                  v-if="fBeetsLoading"
                  class="h-6 w-24 mb-1"
                  white
                />
                <p v-else class="text-sm font-bold md:text-lg">
                  1,230.2
                </p>
                <p class="text-sm md:text-base text-primary">
                  BEETS
                </p>
              </div>
            </div>
          </div>
        </BalCard>
      </div>
    </div>
    <!--
    <div class="flex flex-col justify-center md:flex-row">
      <div class="flex flex-col w-full max-w-3xl mx-auto mb-4 md:m-0">
        <BalCard shadow="xl" class="mb-4">
          <div class="flex">
            <div class="flex-1">
              <h4>fBEETS APR</h4>
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
          &lt;!&ndash;      <SuccessOverlay
            v-if="true"
            :title="$t('farmDepositSettled')"
            :description="$t('farmDepositSuccess')"
            :closeLabel="$t('close')"
            :explorerLink="explorer.txLink(txHash)"
            @close="farmInvestmentSuccess = false"
            class="h-96"
          />&ndash;&gt;

          <h4 class="mt-6">Unstake</h4>
          <FreshBeetsWithdrawForm />
          &lt;!&ndash;      <SuccessOverlay
            v-if="farmWithdrawalSuccess"
            :title="$t('farmWithdrawalSettled')"
            :description="$t('farmWithdrawalSuccess')"
            :closeLabel="$t('close')"
            :explorerLink="explorer.txLink(txHash)"
            @close="farmWithdrawalSuccess = false"
          />&ndash;&gt;
        </BalCard>
      </div>
    </div>-->
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
import FreshBeetsAprTooltip from '@/beethovenx/components/pages/fbeets/FreshBeetsAprTooltip.vue';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';

export default defineComponent({
  components: {
    BalIcon,
    BalBtn,
    StepContainer,
    FreshBeetsAprTooltip,
    BalCard
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
