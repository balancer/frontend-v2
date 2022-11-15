<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import TokenAmounts from './components/TokenAmounts.vue';
import WithdrawSummary from './components/WithdrawSummary.vue';
import useExitPool from '@/composables/pools/useExitPool';
import WithdrawActionsV2 from './components/WithdrawActionsV2.vue';

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
defineProps<Props>();

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
const { amountsOut, priceImpact, fiatTotalOut, fiatAmountsOut } = useExitPool();

/**
 * COMPUTED
 */
const title = computed((): string =>
  withdrawalConfirmed.value
    ? t('withdraw.preview.titles.confirmed')
    : t('withdraw.preview.titles.default')
);

const amountMap = computed((): AmountMap => {
  const amountMap = {};
  amountsOut.value.forEach(({ address, value }) => {
    if (bnum(value).gt(0)) amountMap[address] = value;
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
      :amountMap="amountMap"
      :tokenMap="tokenMap"
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
