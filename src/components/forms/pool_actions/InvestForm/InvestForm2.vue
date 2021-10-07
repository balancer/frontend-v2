<script setup lang="ts">
import { reactive, toRef, computed, ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isStableLike } from '@/composables/usePool';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import useInvestFormMath from './composables/useInvestFormMath';
import { isRequired } from '@/lib/utils/validations';
import { bnum } from '@/lib/utils';
import { useI18n } from 'vue-i18n';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

type FormState = {
  amounts: string[];
  propAmounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
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
  propAmounts: [],
  validInputs: [],
  highPriceImpactAccepted: false,
  submitting: false
});

const showInvestPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const investMath = useInvestFormMath(
  toRef(props, 'pool'),
  toRef(state, 'amounts')
);

const {
  hasAmounts,
  fullAmounts,
  fiatTotal,
  priceImpact,
  highPriceImpact,
  maximizeAmounts,
  maximized,
  optimizeAmounts,
  optimized,
  propSuggestions
} = investMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

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

function onAmountChange(newAmount: string, index: number): void {
  state.amounts[index] = newAmount;
}

function propSuggestion(index: number): string {
  return bnum(propSuggestions.value[index]).gt(0)
    ? propSuggestions.value[index]
    : '0.0';
}

function hint(index: number): string {
  return bnum(propSuggestion(index)).gt(0) ? t('proportionalSuggestion') : '';
}
</script>

<template>
  <BalForm ref="investForm">
    <TokenInput
      v-for="(tokenAddress, i) in pool.tokenAddresses"
      :key="tokenAddress"
      :name="tokenAddress"
      :address="tokenAddress"
      :weight="tokenWeight(tokenAddress)"
      v-model:amount="state.amounts[i]"
      v-model:isValid="state.validInputs[i]"
      :hintAmount="propSuggestion(i)"
      :hint="hint(i)"
      class="mb-4"
      fixedToken
      @update:amount="onAmountChange($event, i)"
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

    <div class="mt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click.prevent="toggleWalletSelectModal"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="!hasAmounts || !hasValidInputs || isMismatchedNetwork"
        block
        @click.prevent="showInvestPreview = true"
      />
    </div>

    <teleport to="#modal">
      <InvestPreviewModal
        v-if="showInvestPreview"
        :pool="pool"
        :investMath="investMath"
        :fullAmounts="fullAmounts"
        :priceImpact="priceImpact"
        @close="showInvestPreview = false"
      />
    </teleport>
  </BalForm>
</template>
