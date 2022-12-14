<script setup lang="ts">
import { groupBy, orderBy } from 'lodash';
import { computed } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { TokenInfoMap } from '@/types/TokenList';
/**
 * TYPES
 */
type Props = {
  amountMap: AmountMap;
  fiatAmountMap: AmountMap;
  tokenMap: TokenInfoMap;
  fiatTotal: string;
  title?: string;
  hideAmountShare?: boolean;
  showZeroAmounts?: boolean;
};
type AmountMap = {
  [address: string]: string;
};
/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  title: '',
  hideAmountShare: false,
  showZeroAmounts: false,
});
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
/**
 * COMPUTED
 */
const sortedAmounts = computed(() =>
  orderBy(
    Object.entries(props.fiatAmountMap),
    ([, fiatAmount]) => Number(fiatAmount),
    'desc'
  ).map(([address, fiatAmount]) => ({
    amount: props.amountMap[address],
    fiatAmount,
    address,
  }))
);
const groupedAmounts = computed(() =>
  groupBy(sortedAmounts.value, amounts =>
    bnum(amounts.amount || '0').isZero() ? 'zeroAmounts' : 'nonZeroAmounts'
  )
);
const amountsToShow = computed(() =>
  props.showZeroAmounts
    ? sortedAmounts.value
    : groupedAmounts.value.nonZeroAmounts
);
/**
 * METHODS
 */
// The investment amount's relative percentage of the total fiat investment value.
// This has nothing to do with the pool weights.
function amountShare(address: string): string {
  return bnum(props.fiatAmountMap[address]).div(props.fiatTotal).toString();
}
</script>
  
<template>
  <div class="token-amount-table">
    <div v-if="props.title" class="title">
      {{ props.title }}
    </div>
    <div v-for="token in amountsToShow" :key="token.address" class="relative">
      <div class="token-amount-table-content">
        <div class="flex flex-col self-center mr-3">
          <div class="font-medium">
            <span class="font-numeric">
              {{ fNum2(token.amount, FNumFormats.token) }}
            </span>
            {{ tokenMap[token.address]?.symbol }}
          </div>
          <div
            v-if="Number(token.fiatAmount) > 0"
            class="text-sm text-secondary font-numeric"
          >
            {{ fNum2(token.fiatAmount, FNumFormats.fiat) }}
            <span v-if="!hideAmountShare">
              ({{ fNum2(amountShare(token.address), FNumFormats.percent) }})
            </span>
          </div>
        </div>
        <BalAsset :address="token.address" :size="36" />
      </div>
    </div>
  </div>
</template>
  
  <style scoped>
.token-amount-table {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg overflow-hidden;
}

.title {
  @apply dark:bg-gray-800 bg-gray-50 px-3 py-2;
  @apply font-medium text-sm text-gray-600 dark:text-gray-400;
}

.token-amount-table-content {
  @apply p-3 flex justify-between;
}
</style>
