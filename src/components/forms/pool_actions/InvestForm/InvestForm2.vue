<script setup lang="ts">
import { reactive, toRef } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isStableLike } from '@/composables/usePool';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import FormTotals from './components/FormTotals.vue';
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
const props = withDefaults(defineProps<Props>(), {});

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
  fiatTotal,
  priceImpact,
  highPriceImpact,
  maximizeAmounts,
  maximized
} = useInvestFormMath(toRef(props, 'pool'), toRef(state, 'amounts'));

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
    <FormTotals
      :total="fiatTotal"
      :priceImpact="priceImpact"
      :highPriceImpact="highPriceImpact"
      :maximized="maximized"
      @maximize="maximizeAmounts"
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
  </BalForm>
</template>
