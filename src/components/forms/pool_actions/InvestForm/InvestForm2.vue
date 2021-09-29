<script setup lang="ts">
import { reactive, toRef, computed, ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isStableLike } from '@/composables/usePool';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestFormActions from './components/InvestFormActions.vue';
import InvestPreviewModal from './components/InvestPreviewModal.vue';
import useInvestFormMath from './composables/useInvestFormMath';
import { isRequired } from '@/lib/utils/validations';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { getPoolWeights } from '@/services/pool/pool.helper';
import { bnum } from '@/lib/utils';
import { useI18n } from 'vue-i18n';
import { FormRef } from '@/types';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';

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

const emit = defineEmits<{
  (e: 'success', value: TransactionResponse): void;
}>();

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

const investForm = ref<FormRef>({} as FormRef);
const showInvestPreview = ref(false);

/**
 * COMPOSABLES
 */
const {
  hasAmounts,
  fullAmounts,
  fiatTotal,
  fiatTotalLabel,
  priceImpact,
  highPriceImpact,
  maximizeAmounts,
  maximized,
  optimizeAmounts,
  optimized,
  propSuggestions,
  bptOut
} = useInvestFormMath(toRef(props, 'pool'), toRef(state, 'amounts'));

const { t } = useI18n();

const { account, getProvider } = useWeb3();

const { addTransaction } = useTransactions();

const { txListener } = useEthers();

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

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

async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('transactionSummary.investInPool', [
      fiatTotalLabel.value,
      getPoolWeights(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  txListener(tx, {
    onTxConfirmed: (tx: TransactionResponse) => {
      emit('success', tx);
      state.amounts = [];
      state.submitting = false;
      showInvestPreview.value = false;
    },
    onTxFailed: () => {
      state.submitting = false;
    }
  });
}

async function submit(): Promise<void> {
  if (!investForm.value.validate()) {
    showInvestPreview.value = false;
    return;
  }
  try {
    state.submitting = true;

    const tx = await poolExchange.join(
      getProvider(),
      account.value,
      fullAmounts.value,
      bptOut.value
    );

    console.log('Receipt', tx);

    handleTransaction(tx);
  } catch (error) {
    console.error(error);
    state.submitting = false;
  }
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

    <InvestFormActions
      :hasAmounts="hasAmounts"
      :hasValidInputs="hasValidInputs"
      class="mt-4"
      @preview="showInvestPreview = true"
    />

    <teleport to="#modal">
      <InvestPreviewModal
        v-if="showInvestPreview"
        :pool="pool"
        :amounts="fullAmounts"
        :priceImpact="priceImpact"
        :submitting="state.submitting"
        @close="showInvestPreview = false"
        @invest="submit"
      />
    </teleport>
  </BalForm>
</template>
