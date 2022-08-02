<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import { InvestMathResponse } from '../../composables/useInvestMath';
import useInvestState from '../../composables/useInvestState';
import InvestActions from './components/InvestActions.vue';
import InvestSummary from './components/InvestSummary.vue';
import TokenAmounts from './components/TokenAmounts.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  math: InvestMathResponse;
  tokenAddresses: string[];
};

type AmountMap = {
  [address: string]: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'showStakeModal'): void;
}>();

/**
 * STATE
 */
const investmentConfirmed = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { getToken } = useTokens();
const { toFiat } = useNumbers();
const { fullAmounts, priceImpact, highPriceImpact, rektPriceImpact } = toRefs(
  props.math
);
const { resetAmounts } = useInvestState();

/**
 * COMPUTED
 */
const title = computed((): string =>
  investmentConfirmed.value
    ? t('investment.preview.titles.confirmed')
    : t('investment.preview.titles.default')
);

const amountMap = computed((): AmountMap => {
  const amountMap = {};
  fullAmounts.value.forEach((amount, i) => {
    amountMap[props.tokenAddresses[i]] = amount;
  });
  return amountMap;
});

const tokenMap = computed((): TokenInfoMap => {
  const tokenMap = {};
  Object.keys(amountMap.value).forEach(address => {
    tokenMap[address] = getToken(address);
  });
  return tokenMap;
});

const fiatAmountMap = computed((): AmountMap => {
  const fiatAmountMap = {};
  Object.keys(amountMap.value).forEach(address => {
    fiatAmountMap[address] = toFiat(amountMap.value[address], address);
  });
  return fiatAmountMap;
});

const fiatTotal = computed((): string =>
  Object.values(fiatAmountMap.value).reduce(
    (total, amount) => bnum(total).plus(amount).toString(),
    '0'
  )
);

/**
 * METHODS
 */
function handleClose(): void {
  if (investmentConfirmed.value) {
    resetAmounts();
  }
  emit('close');
}

function handleShowStakeModal() {
  handleClose();
  emit('showStakeModal');
}
</script>

<template>
  <BalModal show :fireworks="investmentConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="investmentConfirmed"
          size="8"
          color="green"
          class="mr-2 text-white"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ title }}
        </h4>
      </div>
    </template>

    <TokenAmounts
      :amountMap="amountMap"
      :tokenMap="tokenMap"
      :fiatAmountMap="fiatAmountMap"
      :fiatTotal="fiatTotal"
    />

    <InvestSummary
      :pool="pool"
      :fiatTotal="fiatTotal"
      :priceImpact="priceImpact"
      :highPriceImpact="highPriceImpact"
    />

    <BalAlert
      v-if="rektPriceImpact"
      type="error"
      :title="$t('investment.error.rektPriceImpact.title')"
      :description="$t('investment.error.rektPriceImpact.description')"
      class="mt-6 mb-2"
    />

    <InvestActions
      :pool="pool"
      :math="math"
      :tokenAddresses="tokenAddresses"
      :disabled="rektPriceImpact"
      class="mt-4"
      @success="investmentConfirmed = true"
      @show-stake-modal="handleShowStakeModal"
    />
  </BalModal>
</template>
