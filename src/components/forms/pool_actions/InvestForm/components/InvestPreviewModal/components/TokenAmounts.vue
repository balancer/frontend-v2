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
};

type AmountMap = {
  [address: string]: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

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
    address
  }))
);

const groupedAmounts = computed(() =>
  groupBy(sortedAmounts.value, amounts =>
    bnum(amounts.amount).isZero() ? 'zeroAmounts' : 'nonZeroAmounts'
  )
);

const shouldShowCompactViewForZeroAmounts = computed(
  () => (groupedAmounts.value.zeroAmounts?.length || 0) > 3
);

const amountsToShow = computed(() =>
  shouldShowCompactViewForZeroAmounts.value
    ? groupedAmounts.value.nonZeroAmounts
    : sortedAmounts.value
);
/**
 * METHODS
 */
// The investment amount's relative percentage of the total fiat investment value.
// This has nothing to do with the pool weights.
function amountShare(address: string): string {
  return bnum(props.fiatAmountMap[address])
    .div(props.fiatTotal)
    .toString();
}
</script>

<template>
  <div class="token-amount-table">
    <div v-for="token in amountsToShow" :key="token.address" class="relative">
      <div class="token-amount-table-content items-center">
        <div class="flex items-center">
          <BalAsset :address="token.address" :size="36" />
          <div class="flex flex-col ml-3">
            <div class="font-medium text-lg">
              <span class="font-numeric">
                {{ fNum2(token.amount, FNumFormats.token) }}
              </span>
              {{ tokenMap[token.address].symbol }}
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-500 font-numeric">
          {{ fNum2(token.fiatAmount, FNumFormats.fiat) }}
          ({{ fNum2(amountShare(token.address), FNumFormats.percent) }})
        </div>
      </div>
    </div>
    <div
      v-if="shouldShowCompactViewForZeroAmounts"
      class="token-amount-table-content -mb-2 items-start"
    >
      <div class="flex flex-wrap mr-6">
        <div
          class="token"
          v-for="token in groupedAmounts.zeroAmounts"
          :key="token.address"
        >
          <BalAsset :address="token.address" class="mr-2" />
          <span>{{ tokenMap[token.address].symbol }}</span>
        </div>
      </div>
      <div class="text-sm text-gray-500 font-numeric whitespace-nowrap">
        {{ fNum2(0, FNumFormats.fiat) }}
        ({{ fNum2(0, FNumFormats.percent) }})
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-amount-table {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}

.token-amount-table-content {
  @apply p-3 flex justify-between;
}

.token {
  @apply flex items-center px-2 py-1 mr-2 mb-2 rounded-lg bg-gray-100 dark:bg-gray-700;
}
</style>
