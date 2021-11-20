<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FarmWithdrawForm from '@/beethovenx/components/pages/farm/FarmWithdrawForm.vue';
import FreshBeetsWithdrawForm from '@/beethovenx/components/pages/fbeets/FreshBeetsWithdrawForm.vue';

type Props = {
  hasBpt: boolean;
  hasUnstakedFbeets: boolean;
  hasStakedFbeets: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Withdraw your fBEETS from the fBEETS farm"
    :complete="props.hasUnstakedFbeets || props.hasBpt"
  >
    <template v-slot:content>
      <FarmWithdrawForm
        :farm-id="appNetworkConfig.fBeets.farmId"
        :token-address="appNetworkConfig.fBeets.address"
        token-name="fBEETS"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Burn your fBEETS and receive Fidelio Duetto BPTs"
    :complete="props.hasBpt"
  >
    <template v-slot:content>
      <FreshBeetsWithdrawForm />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Withdraw your BEETS/FTM from the Fidelio Duetto pool"
    :complete="false"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'withdraw',
          params: { id: appNetworkConfig.fBeets.poolId }
        }"
        label="Withdraw"
      />
    </template>
  </StepContainer>
</template>
