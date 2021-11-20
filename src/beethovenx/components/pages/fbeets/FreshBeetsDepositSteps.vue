<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FreshBeetsDepositForm from '@/beethovenx/components/pages/fbeets/FreshBeetsDepositForm.vue';
import FarmDepositForm from '@/beethovenx/components/pages/farm/FarmDepositForm.vue';

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
    title="Invest your BEETS into the Fidelio Duetto pool"
    :complete="props.hasBpt || props.hasUnstakedFbeets || props.hasStakedFbeets"
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
    :complete="props.hasUnstakedFbeets || props.hasStakedFbeets"
  >
    <template v-slot:content>
      <FreshBeetsDepositForm />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Stake your fBEETS into the fBEETS farm"
    :complete="props.hasStakedFbeets"
  >
    <template v-slot:content>
      <FarmDepositForm
        :farm-id="appNetworkConfig.fBeets.farmId"
        :token-address="appNetworkConfig.fBeets.address"
        token-name="fBEETS"
      />
    </template>
  </StepContainer>
</template>
