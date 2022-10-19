<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

// import { InvestMathResponse } from '../../composables/useInvestMath';
import useInvestState from '../../composables/useInvestState';
import InvestSummary from './components/InvestSummary.vue';
import TokenAmounts from './components/TokenAmounts.vue';
// import { SwapInfo } from '@balancer-labs/sdk';
import InvestActionsSingleToken from './components/InvestActionsSingleToken.vue';
import { TransactionResponse } from '@ethersproject/abstract-provider';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  // math: InvestMathResponse;
  fullAmounts: string[];
  highPriceImpact: boolean;
  rektPriceImpact: boolean;
  tokenAddresses: string[];
  // swapRoute?: SwapInfo;
  join: () => Promise<TransactionResponse>;
  bptOut: string;
  priceImpact: number;
  fiatValueOut: string;
  fiatValueIn: string;
};

type AmountMap = {
  [address: string]: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  // swapRoute: undefined,
  // bptOut: undefined,
});

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
// const {
//   // fullAmounts,
//   // fiatTotal,
//   // priceImpact,
//   // highPriceImpact,
//   // rektPriceImpact,
// } = toRefs(reactive(props.math));
const { resetAmounts } = useInvestState();

/**
 * COMPUTED
 */
const title = computed((): string =>
  investmentConfirmed.value
    ? t('investment.preview.titles.confirmed')
    : t('investment.preview.titles.default')
);

const showTokensOut = computed<boolean>(
  () => !!Object.keys(tokenOutMap.value).length
);

const isSingleAssetInvestment = computed<boolean>(() => true);
const amountInMap = computed((): AmountMap => {
  const amountMap = {};
  props.fullAmounts.forEach((amount, i) => {
    amountMap[props.tokenAddresses[i]] = amount;
  });
  return amountMap;
});

const amountOutMap = computed((): AmountMap => {
  if (!isSingleAssetInvestment.value) return {};
  const amountMap = {
    [props.pool.address]: props.bptOut,
  };
  return amountMap;
});

const tokenInMap = computed((): TokenInfoMap => {
  const tokenMap = {};
  Object.keys(amountInMap.value).forEach(address => {
    tokenMap[address] = getToken(address);
  });
  return tokenMap;
});

const tokenOutMap = computed((): TokenInfoMap => {
  if (!isSingleAssetInvestment.value) return {};
  const tokenMap = {
    [props.pool.address]: getToken(props.pool.address),
  };
  return tokenMap;
});

const fiatAmountInMap = computed((): AmountMap => {
  const fiatAmountMap = {};
  Object.keys(amountInMap.value).forEach(address => {
    fiatAmountMap[address] = toFiat(amountInMap.value[address], address);
  });
  return fiatAmountMap;
});

const fiatAmountOutMap = computed((): AmountMap => {
  if (!props.fiatValueOut) return {};
  const fiatAmountMap = {
    [props.pool.address]: props.fiatValueOut,
  };
  return fiatAmountMap;
});

const fiatTotalOut = computed((): string =>
  Object.values(fiatAmountOutMap.value).reduce(
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
      :title="$t('investment.preview.titles.tokenIn')"
      :amountMap="amountInMap"
      :tokenMap="tokenInMap"
      :fiatAmountMap="fiatAmountInMap"
      :fiatTotal="fiatValueIn"
      :hideAmountShare="isSingleAssetInvestment"
    />
    <TokenAmounts
      v-if="showTokensOut"
      :title="$t('investment.preview.titles.tokenOut')"
      class="mt-4"
      :amountMap="amountOutMap"
      :tokenMap="tokenOutMap"
      :fiatAmountMap="fiatAmountOutMap"
      :fiatTotal="fiatTotalOut"
      hideAmountShare
    />

    <InvestSummary
      :pool="pool"
      :fiatTotal="fiatValueIn"
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

    <InvestActionsSingleToken
      :pool="pool"
      :fiatValueOut="fiatValueOut"
      :bptOut="bptOut"
      :fullAmounts="fullAmounts"
      :join="join"
      :tokenAddresses="tokenAddresses"
      :disabled="rektPriceImpact"
      class="mt-4"
      @success="investmentConfirmed = true"
      @show-stake-modal="handleShowStakeModal"
    />
  </BalModal>
</template>
