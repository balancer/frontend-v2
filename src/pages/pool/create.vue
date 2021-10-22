<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChooseWeights, {
  TokenWeight
} from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import WalletPoolTokens from '@/components/cards/CreatePool/WalletPoolTokens.vue';
import { computed, ref, watch } from 'vue';
import { eq } from 'lodash';
import { StepState } from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';
import BalVerticalSteps from '@/components/_global/BalVerticalSteps/BalVerticalSteps.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const tokenWeights = ref<TokenWeight>();
const tokenColors = ref<string[]>([]);

/**
 * STATE
 */

/**
 * QUERIES
 */

/**
 * COMPUTED
 */
const steps = computed(() => [
  {
    tooltip: 'Choose tokens & weights',
    state: StepState.Active
  },
  {
    tooltip: 'Set pool fees',
    state: StepState.Todo
  },
  {
    tooltip: 'Set initial liquidity',
    state: StepState.Todo
  },
  {
    tooltip: 'Confirm pool creation',
    state: StepState.Todo
  },
])
</script>

<template>
  <div class="w-full grid grid-cols-11 gap-x-8 pt-8 grid-container mx-auto">
    <div class="col-span-3">
      <BalVerticalSteps title='Create a weighted pool steps' :steps="steps"  />
    </div>
    <div class="col-span-5 col-start-4">
      <ChooseWeights v-model:tokenWeights="tokenWeights" />
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
