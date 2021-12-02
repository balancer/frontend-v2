<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import ChooseWeights from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import PoolFees from '@/components/cards/CreatePool/PoolFees.vue';
import SimilarPools from '@/components/cards/CreatePool/SimilarPools.vue';
import InitialLiquidity from '@/components/cards/CreatePool/InitialLiquidity.vue';
import SimilarPoolsCompact from '@/components/cards/CreatePool/SimilarPoolsCompact.vue';
import PreviewPool from '@/components/cards/CreatePool/PreviewPool.vue';
import BalVerticalSteps from '@/components/_global/BalVerticalSteps/BalVerticalSteps.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';

import anime from 'animejs';

import useApp from '@/composables/useApp';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { StepState } from '@/types';
import useBreakpoints from '@/composables/useBreakpoints';

const initialAnimateProps = {
  opacity: 0,
  translateY: '100px',
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
  translateY: '-100px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0
};

/**
 * STATE
 */
const accordionWrapper = ref<HTMLElement>();
const hasCompletedMountAnimation = ref(false);
const prevWrapperHeight = ref(0);
/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const {
  activeStep,
  similarPools,
  maxInitialLiquidity,
  setActiveStep,
  hasInjectedToken,
  seedTokens,
  totalLiquidity
} = usePoolCreation();
const { upToLargeBreakpoint, upToSmallBreakpoint } = useBreakpoints();

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

function setWrapperHeight(dimensions?: { width: number; height: number }) {
  // need to transform the accordion as everything is absolutely
  // positioned inside the AnimateHeight component
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  if (dimensions?.height) prevWrapperHeight.value = dimensions.height;

  let mobileOffset = 50;
  if (upToLargeBreakpoint.value) {
    if (validTokens.length >= 2 && maxInitialLiquidity.value < 20000) {
      mobileOffset += 90;
    }
    if (hasInjectedToken.value) {
      mobileOffset += upToSmallBreakpoint.value ? 145 : 160;
    }
  }
  anime({
    targets: accordionWrapper.value,
    translateY: `${prevWrapperHeight.value + mobileOffset}px`,
    easing: 'spring(0.4, 500, 9, 0)',
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

function handleNavigate(stepIndex: number) {
  setActiveStep(stepIndex);
}

/**
 * WATCHERS
 */

watch([hasInjectedToken, totalLiquidity], () => {
  setWrapperHeight();
});
</script>

<template>
  <Col3Layout offsetGutters mobileHideGutters class="mt-8">
    <template #gutterLeft>
      <div class="col-span-3" v-if="!upToLargeBreakpoint">
        <BalStack vertical v-if="!appLoading">
          <BalVerticalSteps
            title="Create a weighted pool steps"
            :steps="steps"
            @navigate="handleNavigate"
          />
          <AnimatePresence :isVisible="doSimilarPoolsExist && activeStep === 0">
            <SimilarPoolsCompact />
          </AnimatePresence>
        </BalStack>
      </div>
    </template>
    <div class="relative center-col-mh">
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 0"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
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
      <div v-if="upToLargeBreakpoint" ref="accordionWrapper" class="pb-24">
        <BalAccordion
          :sections="[{ title: 'Pool summary', id: 'pool-summary' }]"
        >
          <template v-slot:pool-summary>
            <PoolSummary />
          </template>
        </BalAccordion>
      </div>
    </div>
    <template #gutterRight>
      <div class="col-span-11 lg:col-span-3" v-if="!upToLargeBreakpoint">
        <BalStack vertical spacing="base" v-if="!appLoading">
          <PoolSummary />
          <!-- <WalletInitialLiquidity /> -->
        </BalStack>
      </div>
    </template>
  </Col3Layout>
</template>

<style scoped>
.center-col-mh {
  min-height: 550px;
}
</style>
