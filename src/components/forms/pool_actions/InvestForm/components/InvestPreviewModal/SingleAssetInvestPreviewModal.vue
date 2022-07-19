<script setup lang="ts">
import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import useInvestState from '../../composables/useInvestState';
import { SingleAssetInvestMathResponse } from '../../composables/useSingleAssetInvestMath';
import InvestSummary from './components/InvestSummary.vue';
import SingleAssetInvestActions from './components/SingleAssetInvestActions.vue';
import TokenAmounts from './components/TokenAmounts.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  math: SingleAssetInvestMathResponse;
  tokenAddress: string;
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
const {
  fullAmount,
  fiatTotal,
  priceImpact,
  highPriceImpact,
  rektPriceImpact,
  swapRoute
} = toRefs(props.math);
const { resetAmounts } = useInvestState();

/**
 * COMPUTED
 */
const title = computed((): string =>
  investmentConfirmed.value
    ? t('investment.preview.titles.confirmed')
    : t('investment.preview.titles.default')
);

const amountInMap = computed(
  (): AmountMap => {
    const amountMap = {
      [props.tokenAddress]: fullAmount.value
    };

    return amountMap;
  }
);

const amountOutMap = computed(
  (): AmountMap => {
    if (!swapRoute.value) return {};
    const amountMap = {
      [swapRoute.value.tokenOut]: formatFixed(
        swapRoute.value.returnAmountFromSwaps,
        BigNumber.from(props.pool.onchain?.decimals || 18)
      )
    };

    return amountMap;
  }
);

const tokenInMap = computed(
  (): TokenInfoMap => {
    const tokenMap = {
      [props.tokenAddress]: getToken(props.tokenAddress)
    };
    return tokenMap;
  }
);

const tokenOutMap = computed(
  (): TokenInfoMap => {
    if (!swapRoute.value) return {};
    const tokenMap = {
      [swapRoute.value.tokenOut]: getToken(swapRoute.value.tokenOut)
    };
    return tokenMap;
  }
);

const fiatAmountInMap = computed(
  (): AmountMap => {
    const fiatAmountMap = {
      [props.tokenAddress]: fiatTotal.value
    };

    return fiatAmountMap;
  }
);

const fiatAmountOutMap = computed(
  (): AmountMap => {
    if (!swapRoute.value) return {};
    const fiatAmountMap = {
      [swapRoute.value.tokenOut]: toFiat(
        amountOutMap.value[swapRoute.value.tokenOut],
        swapRoute.value.tokenOut
      )
    };

    return fiatAmountMap;
  }
);

// const fiatTotal = computed((): string =>
//   Object.values(fiatAmountMap.value).reduce(
//     (total, amount) =>
//       bnum(total)
//         .plus(amount)
//         .toString(),
//     '0'
//   )
// );

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
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle
          v-if="investmentConfirmed"
          size="8"
          color="green"
          class="text-white mr-2"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ title }}
        </h4>
      </div>
    </template>

    <TokenAmounts
      :amountMap="amountInMap"
      :tokenMap="tokenInMap"
      :fiatAmountMap="fiatAmountInMap"
      :fiatTotal="fiatTotal"
    />

    <div>Out</div>
    <TokenAmounts
      :amountMap="amountOutMap"
      :tokenMap="tokenOutMap"
      :fiatAmountMap="fiatAmountOutMap"
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

    <SingleAssetInvestActions
      :pool="pool"
      :math="math"
      :tokenAddresses="[tokenAddress]"
      :disabled="rektPriceImpact"
      class="mt-4"
      @success="investmentConfirmed = true"
      @showStakeModal="handleShowStakeModal"
    />
  </BalModal>
</template>
