<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import WithdrawSummary from './components/WithdrawSummary.vue';
import useExitPool from '@/composables/pools/useExitPool';
import WithdrawActionsV2 from './components/WithdrawActionsV2.vue';
import TokenAmounts from '@/components/forms/pool_actions/shared/TokenAmounts.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
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

const {
  bptIn,
  fiatValueIn,
  fiatTotalOut,
  amountsOut,
  priceImpact,
  fiatAmountsOut,
  isSingleAssetExit,
} = useExitPool();

/**
 * COMPUTED
 */
const title = computed((): string =>
  withdrawalConfirmed.value
    ? t('withdraw.preview.titles.confirmed')
    : t('withdraw.preview.titles.default')
);

const showTokensIn = computed<boolean>(() => !isSingleAssetExit.value);

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
  const fiatAmountMap = {
    [props.pool.address]: fiatValueIn.value,
  };
  return fiatAmountMap;
});

const tokenOutMap = computed((): TokenInfoMap => {
  const tokenMap = {};
  amountsOut.value.forEach(item => {
    tokenMap[item.address] = getToken(item.address);
  });
  return tokenMap;
});

const amountsOutMap = computed((): AmountMap => {
  const tokenMap = {};
  amountsOut.value.forEach(item => {
    tokenMap[item.address] = item.value;
  });
  return tokenMap;
});

/**
 * METHODS
 */
function handleClose(): void {
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
      v-if="showTokensIn"
      :title="$t('investment.preview.titles.tokenIn')"
      :amountMap="amountInMap"
      :tokenMap="tokenInMap"
      :fiatAmountMap="fiatAmountInMap"
      :fiatTotal="fiatValueIn"
    />

    <TokenAmounts
      :title="$t('investment.preview.titles.tokenOut')"
      class="mt-4"
      :amountMap="amountsOutMap"
      :tokenMap="tokenOutMap"
      :fiatAmountMap="fiatAmountsOut"
      :fiatTotal="fiatTotalOut"
    />

    <WithdrawSummary
      :pool="pool"
      :fiatTotal="fiatTotalOut"
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
