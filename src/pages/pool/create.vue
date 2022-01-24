<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';

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
import UnknownTokenPriceModal from '@/components/modals/UnknownTokenPrice/UnknownTokenPriceModal.vue';
import TokenPrices from '@/components/cards/CreatePool/TokenPrices.vue';

import anime from 'animejs';

import useApp from '@/composables/useApp';
import usePoolCreation, {
  POOL_CREATION_STATE_KEY,
  POOL_CREATION_STATE_VERSION
} from '@/composables/pools/usePoolCreation';
import { StepState } from '@/types';
import useBreakpoints from '@/composables/useBreakpoints';
import useAlerts from '@/composables/useAlerts';
import { lsGet } from '@/lib/utils';
import useTokens from '@/composables/useTokens';

/**
 * STATE
 */
const accordionWrapper = ref<HTMLElement>();
const hasCompletedMountAnimation = ref(false);
const prevWrapperHeight = ref(0);
const isUnknownTokenModalVisible = ref(false);

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const {
  activeStep,
  similarPools,
  hasInjectedToken,
  hasRestoredFromSavedState,
  tokensList,
  seedTokens,
  setActiveStep,
  setRestoredState,
  importState,
  totalLiquidity,
  resetPoolCreationState
} = usePoolCreation();
const { removeAlert } = useAlerts();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const {
  dynamicDataLoading,
  priceFor,
  tokens,
  injectTokens,
  injectedPrices,
  loading: isLoadingTokens
} = useTokens();

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  removeAlert('return-to-pool-creation');
  if (accordionWrapper.value) {
    anime.set(accordionWrapper.value, {
      opacity: 0
    });
  }
  let previouslySavedState = lsGet(
    POOL_CREATION_STATE_KEY,
    null,
    POOL_CREATION_STATE_VERSION
  );
  if (activeStep.value === 0 && previouslySavedState !== null) {
    // need to make sure to inject any tokens that were chosen
    previouslySavedState = JSON.parse(previouslySavedState);
    importState(previouslySavedState);
    setRestoredState(true);
    await nextTick();
    setActiveStep(previouslySavedState.activeStep);
  }
  // make sure to inject any custom tokens we cannot inject
  // after tokens have finished loading as it will attempt to
  // inject 'known' tokens too, as during mount, tokens are still loading
  injectUnknownPoolTokens();
});

/**
 * COMPUTED
 */
const doSimilarPoolsExist = computed(() => similarPools.value.length > 0);
const validTokens = computed(() => tokensList.value.filter(t => t !== ''));

const unknownTokens = computed(() => {
  return validTokens.value.filter(token => {
    return priceFor(token) === 0 || injectedPrices.value[token];
  });
});

const hasUnknownToken = computed(() =>
  validTokens.value.some(t => priceFor(t) === 0)
);

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

const initialAnimateProps = computed(() => ({
  opacity: 0,
  translateY: '100px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0
}));

const entryAnimateProps = computed(() => ({
  opacity: 1,
  translateY: hasRestoredFromSavedState.value ? '116px' : '0px',
  position: 'relative'
}));

const exitAnimateProps = computed(() => ({
  opacity: 0,
  translateY: '-100px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0
}));

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
  if (dimensions?.height) prevWrapperHeight.value = dimensions.height;
  let mobileOffset = 20;

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
  if (hasRestoredFromSavedState.value) {
    setRestoredState(false);
  }
  setActiveStep(stepIndex);
}

function handleReset() {
  resetPoolCreationState();
  setActiveStep(0);
}

function handleUnknownModalClose() {
  isUnknownTokenModalVisible.value = false;
}

function showUnknownTokenModal() {
  isUnknownTokenModalVisible.value = true;
}

function injectUnknownPoolTokens() {
  if (!isLoadingTokens.value) {
    const uninjectedTokens = seedTokens.value
      .filter(seedToken => tokens.value[seedToken.tokenAddress] === undefined)
      .map(seedToken => seedToken.tokenAddress);
    injectTokens(uninjectedTokens);
  }
}

/**
 * WATCHERS
 */
watch([hasInjectedToken, totalLiquidity], () => {
  setWrapperHeight();
});

// can handle the behaviour to show the unknown token modal
// on next step here, rather than having to clutter the
// usePoolCreation composable further
watch(activeStep, () => {
  if (hasUnknownToken.value && !hasRestoredFromSavedState.value) {
    showUnknownTokenModal();
  }
});

// make sure to inject any custom tokens we cannot inject
// after tokens have finished loading as it will attempt to
// inject 'known' tokens too, as during mount, tokens are still loading
watch(isLoadingTokens, () => {
  injectUnknownPoolTokens();
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
          <AnimatePresence
            :isVisible="
              doSimilarPoolsExist && activeStep === 0 && validTokens.length
            "
          >
            <SimilarPoolsCompact />
          </AnimatePresence>
        </BalStack>
      </div>
    </template>
    <div class="relative center-col-mh">
      <AnimatePresence
        :isVisible="hasRestoredFromSavedState && !appLoading"
        unmountInstantly
      >
        <BalAlert
          type="warning"
          class="mb-4"
          :title="$t('createAPool.recoveredState')"
        >
          {{ $t('createAPool.recoveredStateInfo') }}
          <button @click="handleReset" class="font-semibold text-blue-500">
            {{ $t('clickHere') }}
          </button>
        </BalAlert>
      </AnimatePresence>
      <AnimatePresence
        :isVisible="
          !appLoading && activeStep === 0 && !hasRestoredFromSavedState
        "
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
        <PoolFees @update:height="setWrapperHeight" />
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
        <InitialLiquidity @update:height="setWrapperHeight" />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 4 && !dynamicDataLoading"
        :initial="initialAnimateProps"
        :animate="entryAnimateProps"
        :exit="exitAnimateProps"
        @update-dimensions="setWrapperHeight"
      >
        <PreviewPool />
      </AnimatePresence>
      <div v-if="upToLargeBreakpoint" ref="accordionWrapper" class="pb-24">
        <BalAccordion
          :sections="[
            { title: t('poolSummary'), id: 'pool-summary' },
            { title: t('tokenPrices'), id: 'token-prices' }
          ]"
        >
          <template v-slot:pool-summary>
            <PoolSummary />
          </template>
          <template v-slot:token-prices>
            <TokenPrices />
          </template>
        </BalAccordion>
      </div>
    </div>
    <template #gutterRight>
      <div class="col-span-11 lg:col-span-3" v-if="!upToLargeBreakpoint">
        <BalStack vertical spacing="base" v-if="!appLoading">
          <PoolSummary />
          <TokenPrices :toggleUnknownPriceModal="showUnknownTokenModal" />
        </BalStack>
      </div>
    </template>
  </Col3Layout>
  <UnknownTokenPriceModal
    @close="handleUnknownModalClose"
    :isVisible="isUnknownTokenModalVisible"
    :unknownTokens="unknownTokens"
  />
</template>

<style scoped>
.center-col-mh {
  min-height: 550px;
}
</style>
