<script setup lang="ts">
import { reactive, toRef, computed } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isStableLike } from '@/composables/usePool';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestFormActions from './components/InvestFormActions.vue';
import useInvestFormMath from './composables/useInvestFormMath';
import { isRequired } from '@/lib/utils/validations';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

type FormState = {
  amounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const state = reactive<FormState>({
  amounts: [],
  validInputs: [],
  highPriceImpactAccepted: false
});

/**
 * COMPOSABLES
 */
const {
  hasAmounts,
  fiatTotal,
  priceImpact,
  highPriceImpact,
  maximizeAmounts,
  maximized,
  optimizeAmounts,
  optimized
} = useInvestFormMath(toRef(props, 'pool'), toRef(state, 'amounts'));

/**
 * COMPUTED
 */
const hasValidInputs = computed(() =>
  state.validInputs.every(validInput => validInput === true)
);

/**
 * METHODS
 */
function tokenWeight(address: string): number {
  if (isStableLike(props.pool.poolType)) return 0;
  return props.pool.onchain.tokens[address].weight;
}

function submit() {
  console.log('submit');
}
</script>

<template>
  <BalForm ref="investForm" @on-submit="submit">
    <TokenInput
      v-for="(tokenAddress, i) in pool.tokenAddresses"
      :key="tokenAddress"
      :name="tokenAddress"
      :address="tokenAddress"
      :weight="tokenWeight(tokenAddress)"
      v-model:amount="state.amounts[i]"
      v-model:isValid="state.validInputs[i]"
      class="mb-4"
      fixedToken
    />

    <InvestFormTotals
      :total="fiatTotal"
      :priceImpact="priceImpact"
      :highPriceImpact="highPriceImpact"
      :maximized="maximized"
      :optimized="optimized"
      @maximize="maximizeAmounts"
      @optimize="optimizeAmounts"
    />

    <div v-if="highPriceImpact" class="border rounded-lg p-4 pb-2 mt-4">
      <BalCheckbox
        v-model="state.highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        class="text-gray-500"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>

    <InvestFormActions
      :hasAmounts="hasAmounts"
      :hasValidInputs="hasValidInputs"
      class="mt-4"
    />
  </BalForm>
</template>
