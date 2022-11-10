<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import useWithdrawalState from '../../composables/useWithdrawalState';

import WithdrawSummary from './components/WithdrawSummary.vue';
import useExitPool from '@/composables/pools/useExitPool';
import WithdrawActionsV2 from './components/WithdrawActionsV2.vue';
import TokenAmounts from '@/components/forms/pool_actions/shared/TokenAmounts.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  // math: WithdrawMathResponse;
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
}>();

/**
 * STATE
 */
const withdrawalConfirmed = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { getToken } = useTokens();
const { toFiat } = useNumbers();
const { priceImpact, reset, bptIn, tokensOut, fiatValueIn, fiatValueOut } =
  useExitPool();
const { maxSlider, resetTxState } = useWithdrawalState(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const title = computed((): string =>
  withdrawalConfirmed.value
    ? t('withdraw.preview.titles.confirmed')
    : t('withdraw.preview.titles.default')
);

const showTokensOut = computed<boolean>(
  () => !!Object.keys(tokenOutMap.value).length
);

const amountInMap = computed((): AmountMap => {
  const amountMap = {
    [props.pool.address]: bptIn.value,
  };
  return amountMap;
});

const tokenInMap = computed((): TokenInfoMap => {
  const tokenMap = {
    [props.pool.address]: getToken(props.pool.address),
  };
  return tokenMap;
});

const fiatAmountInMap = computed((): AmountMap => {
  if (!fiatValueIn.value) return {};
  const fiatAmountMap = {
    [props.pool.address]: fiatValueIn.value,
  };
  return fiatAmountMap;
});

const tokenOutMap = computed((): TokenInfoMap => {
  const tokenMap = {};
  Object.keys(tokensOut.value).forEach(item => {
    tokenMap[item] = getToken(item);
  });
  return tokenMap;
});

const fiatAmountOutMap = computed((): AmountMap => {
  const fiatAmountMap = {};
  Object.keys(tokensOut.value).forEach(item => {
    fiatAmountMap[item] = toFiat(tokensOut.value[item], item);
  });
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
  resetTxState();
  if (withdrawalConfirmed.value) {
    reset();
    maxSlider();
  }
  emit('close');
}
</script>

<template>
  <BalModal show :fireworks="withdrawalConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="withdrawalConfirmed"
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
    />

    <TokenAmounts
      v-if="showTokensOut"
      :title="$t('investment.preview.titles.tokenOut')"
      class="mt-4"
      :amountMap="tokensOut"
      :tokenMap="tokenOutMap"
      :fiatAmountMap="fiatAmountOutMap"
      :fiatTotal="fiatTotalOut"
    />

    <WithdrawSummary
      :pool="pool"
      :fiatTotal="fiatValueOut"
      :priceImpact="priceImpact"
    />

    <WithdrawActionsV2
      :pool="pool"
      class="mt-4"
      @error="$emit('close')"
      @success="withdrawalConfirmed = true"
    />
  </BalModal>
</template>
