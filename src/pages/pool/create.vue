<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChooseWeights, {
  TokenWeight
} from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import WalletInitialLiquidity from '@/components/cards/CreatePool/WalletInitialLiquidity.vue';
import PoolFees from '@/components/cards/CreatePool/PoolFees.vue';
import SimilarPools from '@/components/cards/CreatePool/SimilarPools.vue';
import InitialLiquidity from '@/components/cards/CreatePool/InitialLiquidity.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { eq } from 'lodash';
import BalVerticalSteps from '@/components/_global/BalVerticalSteps/BalVerticalSteps.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useApp from '@/composables/useApp';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { StepState } from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';

const initialAnimateProps = {
  opacity: 0,
  translateY: '-100px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0
};

const entryAnimateProps = {
  opacity: 1,
  translateY: '0px',
  position: 'relative'
};
const exitAnimateProps = {
  opacity: 0,
  translateY: '100px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0
};

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const { activeStep, similarPools } = usePoolCreation();

/**
 * STATE
 */
const route = useRoute();
const tokenColors = ref<string[]>([]);
/**
 * QUERIES
 */

const onNextStep = () => {
  activeStep.value += 1;
};

/**
 * COMPUTED
 */
const steps = computed(() => [
  {
    tooltip: 'Choose tokens & weights',
    state: activeStep.value === 0 ? StepState.Active : StepState.Todo
  },
  {
    tooltip: 'Set pool fees',
    state: activeStep.value === 1 ? StepState.Active : StepState.Todo
  },
  {
    tooltip: 'Similar pools',
    state: StepState.Warning,
    isVisible: similarPools.value.length > 0 && activeStep.value === 2
  },
  {
    tooltip: 'Set initial liquidity',
    state: activeStep.value === 3 ? StepState.Active : StepState.Todo
  },
  {
    tooltip: 'Confirm pool creation',
    state: activeStep.value === 4 ? StepState.Active : StepState.Todo
  }
]);
</script>

<template>
  <div class="w-full grid grid-cols-11 gap-x-8 pt-8 grid-container mx-auto">
    <div class="col-span-3">
      <BalVerticalSteps title="Create a weighted pool steps" :steps="steps" />
    </div>
    <div class="col-span-5 col-start-4 relative">
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 0"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
      >
        <ChooseWeights />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 1"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
      >
        <PoolFees @nextStep="onNextStep" />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 2"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
      >
        <SimilarPools />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 3"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
      >
        <InitialLiquidity />
      </AnimatePresence>
    </div>
    <div class="col-span-3">
      <BalStack vertical spacing="base">
        <PoolSummary v-model:colors="tokenColors" />
        <WalletInitialLiquidity :colors="tokenColors" />
      </BalStack>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  max-width: 1100px;
}
</style>
