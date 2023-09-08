<script setup lang="ts">
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import BalVerticalSteps from '@/components/_global/BalVerticalSteps/BalVerticalSteps.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import ChooseWeights from '@/components/cards/CreatePool/ChooseWeights.vue';
import InitialLiquidity from '@/components/cards/CreatePool/InitialLiquidity.vue';
import PoolFees from '@/components/cards/CreatePool/PoolFees.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import PreviewPool from '@/components/cards/CreatePool/PreviewPool.vue';
import SimilarPools from '@/components/cards/CreatePool/SimilarPools.vue';
import SimilarPoolsCompact from '@/components/cards/CreatePool/SimilarPoolsCompact.vue';
import TokenPrices from '@/components/cards/CreatePool/TokenPrices.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import UnknownTokenPriceModal from '@/components/modals/UnknownTokenPrice/UnknownTokenPriceModal.vue';
import usePoolCreation, {
  POOL_CREATION_STATE_KEY,
  POOL_CREATION_STATE_VERSION,
} from '@/composables/pools/usePoolCreation';
import useAlerts from '@/composables/useAlerts';
import useBreakpoints from '@/composables/useBreakpoints';
import { useTokens } from '@/providers/tokens.provider';
import { lsGet, selectByAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { StepState } from '@/types';

/**
 * STATE
 */
const isUnknownTokenModalVisible = ref(false);
const isLoading = ref(true);
// const showIntroModal = ref(true);

/**
 * COMPOSABLES
 */
const {
  activeStep,
  similarPools,
  hasRestoredFromSavedState,
  tokensList,
  seedTokens,
  setActiveStep,
  setRestoredState,
  importState,
  resetPoolCreationState,
  retrievePoolAddress,
  retrievePoolDetails,
} = usePoolCreation();
const { removeAlert } = useAlerts();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { priceFor, getToken, injectTokens, injectedPrices } = useTokens();
const route = useRoute();
const { isWalletReady } = useWeb3();

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  removeAlert('return-to-pool-creation');

  let previouslySavedState = lsGet(
    POOL_CREATION_STATE_KEY,
    null,
    POOL_CREATION_STATE_VERSION
  );
  if (
    activeStep.value === 0 &&
    previouslySavedState !== null &&
    !poolCreateTx.value
  ) {
    // need to make sure to inject any tokens that were chosen
    previouslySavedState = JSON.parse(previouslySavedState);
    importState(previouslySavedState);
    setRestoredState(true);
    await nextTick();
    setActiveStep(previouslySavedState.activeStep);
    if (previouslySavedState.createPoolTxHash) {
      await retrievePoolAddress(previouslySavedState.createPoolTxHash);
    }
    // showIntroModal.value = false;
  } else if (previouslySavedState === null) {
    resetPoolCreationState();
  }
  // make sure to inject any custom tokens we cannot inject
  // after tokens have finished loading as it will attempt to
  // inject 'known' tokens too, as during mount, tokens are still loading
  await injectUnknownPoolTokens();
  isLoading.value = false;
});

/**
 * COMPUTED
 */
const poolCreateTx = computed(() => route.params.tx || '');
const doSimilarPoolsExist = computed(() => similarPools.value.length > 0);
const validTokens = computed(() => tokensList.value.filter(t => t !== ''));

const unknownTokens = computed(() => {
  return validTokens.value.filter(token => {
    return (
      priceFor(token) === 0 || selectByAddress(injectedPrices.value, token)
    );
  });
});

const hasUnknownToken = computed(() =>
  validTokens.value.some(t => priceFor(t) === 0)
);

const steps = computed(() => [
  {
    tooltip: 'Choose tokens & weights',
    state: getStepState(0),
    label: 1,
  },
  {
    tooltip: 'Set pool fees',
    state: getStepState(1),
    label: 2,
  },
  {
    tooltip: 'Similar pools',
    state: StepState.Warning,
    isVisible: doSimilarPoolsExist.value && activeStep.value === 2,
  },
  {
    tooltip: 'Set initial liquidity',
    state: getStepState(3),
    label: 3,
  },
  {
    tooltip: 'Confirm pool creation',
    state: getStepState(4),
    label: 4,
  },
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

async function injectUnknownPoolTokens() {
  const uninjectedTokens = seedTokens.value
    .filter(seedToken => getToken(seedToken.tokenAddress) === undefined)
    .map(seedToken => seedToken.tokenAddress)
    .filter(token => token !== '');
  await injectTokens(uninjectedTokens);
}

/**
 * WATCHERS
 */
// can handle the behaviour to show the unknown token modal
// on next step here, rather than having to clutter the
// usePoolCreation composable further
watch(activeStep, () => {
  if (hasUnknownToken.value && !hasRestoredFromSavedState.value) {
    showUnknownTokenModal();
  }
});

// we need to wait for a ready wallet before executing this
// as we need that getProvider() call to suceed
watch(
  isWalletReady,
  async () => {
    if (isWalletReady.value && poolCreateTx.value) {
      await retrievePoolDetails(poolCreateTx.value as string);
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div>
    <Col3Layout offsetGutters mobileHideGutters class="mt-8">
      <template #gutterLeft>
        <div v-if="!upToLargeBreakpoint" class="col-span-3">
          <BalStack vertical>
            <BalVerticalSteps
              title="Create a weighted pool steps"
              :steps="steps"
              @navigate="handleNavigate"
            />
            <AnimatePresence
              :isVisible="
                doSimilarPoolsExist && activeStep === 0 && !!validTokens.length
              "
            >
              <SimilarPoolsCompact />
            </AnimatePresence>
          </BalStack>
        </div>
      </template>
      <div class="relative center-col-mh">
        <BalAlert
          v-if="!!hasRestoredFromSavedState"
          type="warning"
          class="mb-4"
          :title="$t('createAPool.recoveredState')"
        >
          {{ $t('createAPool.recoveredStateInfo') }}

          {{ $t('wantToStartOverInstead') }}
          <button class="font-semibold text-blue-500" @click="handleReset">
            {{ $t('clearForms') }}
          </button>
        </BalAlert>

        <BalLoadingBlock v-if="isLoading" class="h-64" />
        <ChooseWeights
          v-else-if="activeStep === 0 && !hasRestoredFromSavedState"
        />
        <PoolFees v-else-if="activeStep === 1" />
        <SimilarPools v-else-if="activeStep === 2 && similarPools.length > 0" />
        <InitialLiquidity v-else-if="!isLoading && activeStep === 3" />
        <PreviewPool v-else-if="activeStep === 4" />

        <div v-if="upToLargeBreakpoint" class="pb-24">
          <BalAccordion
            :dependencies="validTokens"
            :sections="[
              { title: t('createAPool.poolSummary'), id: 'pool-summary' },
              { title: t('tokenPrices'), id: 'token-prices' },
            ]"
          >
            <template #pool-summary>
              <PoolSummary />
            </template>
            <template #token-prices>
              <TokenPrices />
            </template>
          </BalAccordion>
        </div>
      </div>
      <template #gutterRight>
        <div v-if="!upToLargeBreakpoint" class="col-span-11 lg:col-span-3">
          <BalStack vertical spacing="base">
            <PoolSummary />
            <TokenPrices
              v-if="validTokens.length > 0"
              :toggleUnknownPriceModal="showUnknownTokenModal"
            />
          </BalStack>
        </div>
      </template>
    </Col3Layout>
    <UnknownTokenPriceModal
      :isVisible="isUnknownTokenModalVisible"
      :unknownTokens="unknownTokens"
      @close="handleUnknownModalClose"
    />
    <!-- <IntroModal
      v-if="showIntroModal && !hasRestoredFromSavedState"
      @close="showIntroModal = false"
    /> -->
  </div>
</template>

<style scoped>
.center-col-mh {
  min-height: 550px;
}
</style>
