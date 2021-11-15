<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import ChooseWeights, {
  TokenWeight
} from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import WalletInitialLiquidity from '@/components/cards/CreatePool/WalletInitialLiquidity.vue';
import PoolFees from '@/components/cards/CreatePool/PoolFees.vue';
import SimilarPools from '@/components/cards/CreatePool/SimilarPools.vue';
import InitialLiquidity from '@/components/cards/CreatePool/InitialLiquidity.vue';
import PreviewPool from '@/components/cards/CreatePool/PreviewPool.vue';
import WalletPoolTokens from '@/components/cards/CreatePool/WalletPoolTokens.vue';
import SimilarPoolsCompact from '@/components/cards/CreatePool/SimilarPoolsCompact.vue';
import { StepState } from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';

import anime from 'animejs';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

import useApp from '@/composables/useApp';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import { useRoute } from 'vue-router';

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
 * STATE
 */
const route = useRoute();
const currentWrapperHeight = ref(0);
const accordionWrapper = ref<HTMLElement>();
const hasCompletedMountAnimation = ref(false);

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const { activeStep, similarPools, tokensList } = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();

onMounted(() => {
  if (accordionWrapper.value) {
    anime.set(accordionWrapper.value, {
      opacity: 0
    });
  }
});

/**
 * COMPUTED
 */
const doSimilarPoolsExist = computed(() => similarPools.value.length > 0);

const steps = computed(() => [
  {
    tooltip: 'Choose tokens & weights',
    state: getStepState(0),
    label: 1
  },
  {
    tooltip: 'Set pool fees',
    state: getStepState(1),
    label: 2
  },
  {
    tooltip: 'Similar pools',
    state: StepState.Warning,
    isVisible: doSimilarPoolsExist.value && activeStep.value === 2
  },
  {
    tooltip: 'Set initial liquidity',
    state: getStepState(3),
    label: 3
  },
  {
    tooltip: 'Confirm pool creation',
    state: getStepState(4),
    label: 4
  }
]);

/**
 * FUNCTIONS
 */
function getStepState(idx: number) {
  if (activeStep.value === idx) {
    return StepState.Active;
  } else {
    if (activeStep.value > idx) {
      return StepState.Completed;
    } else {
      return StepState.Todo;
    }
  }
}

function setWrapperHeight(dimensions: { width: number; height: number }) {
  // need to transform the accordion as everything is absolutely
  // positioned inside the AnimateHeight component
  anime({
    targets: accordionWrapper.value,
    translateY: `${dimensions.height}px`,
    complete: () => {
      if (!hasCompletedMountAnimation.value) {
        anime({
          targets: accordionWrapper.value,
          opacity: 1,
          complete: () => {
            hasCompletedMountAnimation.value = true;
          }
        });
      }
    }
  });
}
</script>

<template>
  <div class="w-full grid grid-cols-11 gap-x-8 pt-8 grid-container mx-auto">
    <div class="col-span-3" v-if="!upToLargeBreakpoint">
      <BalStack vertical>
        <BalVerticalSteps title="Create a weighted pool steps" :steps="steps" />
        <WalletPoolTokens v-if="activeStep === 3" :tokens="tokensList" />
        <AnimatePresence :isVisible="doSimilarPoolsExist">
          <SimilarPoolsCompact />
        </AnimatePresence>
      </BalStack>
    </div>
    <div class="col-span-11 lg:col-span-5 col-start-1 lg:col-start-4 relative">
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 0"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
      >
        <ChooseWeights @update:height="setWrapperHeight" />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 1"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
      >
        <PoolFees />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 2 && similarPools.length > 0"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
      >
        <SimilarPools />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 3"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
      >
        <InitialLiquidity />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 4"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
      >
        <PreviewPool />
      </AnimatePresence>
    </div>
    <div class="col-span-11 lg:col-span-3" v-if="!upToLargeBreakpoint">
      <BalStack vertical spacing="base">
        <PoolSummary />
        <WalletInitialLiquidity />
      </BalStack>
    </div>
    <div ref="accordionWrapper" class="col-span-11 mt-4 pb-24">
      <BalAccordion
        v-if="upToLargeBreakpoint"
        :sections="[
          { title: 'Pool summary', id: 'pool-summary' },
          { title: 'Max initial liquidity', id: 'max-initial-liquidity' }
        ]"
      >
        <template v-slot:pool-summary>
          <PoolSummary />
        </template>
        <template v-slot:max-initial-liquidity>
          <WalletInitialLiquidity />
        </template>
      </BalAccordion>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  max-width: 1100px;
}
</style>
