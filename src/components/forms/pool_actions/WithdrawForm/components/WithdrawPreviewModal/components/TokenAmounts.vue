<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
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
const { fNum } = useNumbers();
const { currency } = useUserSettings();

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
    <div
      v-for="(amount, address, index) in amountMap"
      :key="address"
      class="relative"
    >
      <div class="token-amount-table-content">
        <BalAsset :address="address" :size="36" />
        <div class="flex flex-col ml-3">
          <div class="font-medium text-lg">
            <span class="font-numeric">
              {{ fNum(amount, 'token') }}
            </span>
            {{ tokenMap[address].symbol }}
          </div>
          <div class="text-sm text-gray-500 font-numeric">
            {{ fNum(fiatAmountMap[address], currency) }}
            ({{ fNum(amountShare(address), 'percent') }})
          </div>
        </div>
      </div>
      <div
        v-if="index != Object.keys(amountMap).length - 1"
        class="addition-separator"
      >
        <BalIcon name="plus" size="xl" class="font-bold" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-amount-table {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}

.token-amount-table-content {
  @apply p-3 flex items-center;
}

.addition-separator {
  @apply absolute bottom-0 right-0 -mb-6 mr-6;
  @apply w-12 h-12 rounded-full bg-white dark:bg-gray-900 z-10;
  @apply border dark:border-gray-700;
  @apply flex items-center justify-center;
}
</style>
