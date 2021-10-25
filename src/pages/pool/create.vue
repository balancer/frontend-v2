<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChooseWeights, {
  TokenWeight
} from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import WalletPoolTokens from '@/components/cards/CreatePool/WalletPoolTokens.vue';
import PoolFees from '@/components/cards/CreatePool/PoolFees.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { eq } from 'lodash';
import { StepState } from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';
import BalVerticalSteps from '@/components/_global/BalVerticalSteps/BalVerticalSteps.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useApp from '@/composables/useApp';

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();

/**
 * STATE
 */
const route = useRoute();
const tokenWeights = ref<TokenWeight>();
const tokenColors = ref<string[]>([]);
const activeStep = ref(0);
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
    tooltip: 'Set initial liquidity',
    state: activeStep.value === 2 ? StepState.Active : StepState.Todo
  },
  {
    tooltip: 'Confirm pool creation',
    state: activeStep.value === 3 ? StepState.Active : StepState.Todo
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
        :isVisible="!appLoading && activeStep === 1"
        :initial="{ opacity: 0, translateY: '-100px', position: 'absolute', top: 0, left: 0, right: 0 }"
        :animate="{ opacity: 1, translateY: '0px', position: 'relative' }"
        :exit="{ opacity: 0, translateY: '100px', position: 'absolute', top: 0, left: 0, right: 0 }"
      >
        <PoolFees @nextStep="onNextStep" />
      </AnimatePresence>
      <AnimatePresence
        :isVisible="!appLoading && activeStep === 0"
        :initial="{ opacity: 0, translateY: '-100px', position: 'absolute', top: 0, left: 0, right: 0 }"
        :animate="{ opacity: 1, translateY: '0px', position: 'relative' }"
        :exit="{ opacity: 0, translateY: '100px', position: 'absolute', top: 0, left: 0, right: 0 }"
      >
        <ChooseWeights
          v-model:tokenWeights="tokenWeights"
          @nextStep="onNextStep"
        />
      </AnimatePresence>
    </div>
    <div class="col-span-3">
      <BalStack vertical spacing="base">
        <PoolSummary v-model:colors="tokenColors" :tokens="tokenWeights" />
        <WalletPoolTokens :colors="tokenColors" :tokenWeights="tokenWeights" />
      </BalStack>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  max-width: 1100px;
}
</style>
