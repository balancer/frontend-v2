<script setup lang="ts">
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfoMap } from '@/types/TokenList';
import { bnum } from '@/lib/utils';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  amounts: string[];
  priceImpact: number;
  submitting: boolean;
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
  (e: 'invest'): void;
}>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();

/**
 * COMPUTED
 */
const tokenAddresses = computed((): string[] => props.pool.tokenAddresses);

const amountMap = computed(
  (): AmountMap => {
    const amountMap = {};
    props.amounts.forEach((amount, i) => {
      if (hasAmount(i)) amountMap[tokenAddresses.value[i]] = amount;
    });
    return amountMap;
  }
);

const tokenMap = computed(
  (): TokenInfoMap => {
    const tokenMap = {};
    Object.keys(amountMap.value).forEach(address => {
      tokenMap[address] = getToken(address);
    });
    return tokenMap;
  }
);

const fiatAmountMap = computed(
  (): AmountMap => {
    const fiatAmountMap = {};
    Object.keys(amountMap.value).forEach(address => {
      fiatAmountMap[address] = toFiat(amountMap.value[address], address);
    });
    return fiatAmountMap;
  }
);

const fiatTotal = computed((): string =>
  Object.values(fiatAmountMap.value).reduce(
    (total, amount) =>
      bnum(total)
        .plus(amount)
        .toString(),
    '0'
  )
);

const lmBreakdown = computed(() => [
  { amount: '0', symbol: 'XXX' },
  { amount: '0', symbol: 'XXX' },
  { amount: '0', symbol: 'XXX' }
]);

/**
 * METHODS
 */
function hasAmount(index: number): boolean {
  return bnum(props.amounts[index]).gt(0);
}

// The investment amount's relative percentage of the total fiat investment value.
// This has nothing to do with the pool weights.
function amountShare(address: string): string {
  return bnum(fiatAmountMap.value[address])
    .div(fiatTotal.value)
    .toString();
}
</script>

<template>
  <BalModal title="Investment preview" show @close="emit('close')">
    <div class="token-input-table">
      <div
        v-for="(amount, address, index) in amountMap"
        :key="address"
        class="relative"
      >
        <div class="token-input-table-content">
          <BalAsset :iconURI="tokenMap[address].logoURI" size="36" />
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
    <div class="summary-table">
      <h6 class="p-2">
        {{ $t('summary') }}
      </h6>
      <div class="flex flex-col py-2">
        <div class="summary-table-row">
          <div class="summary-table-label">
            {{ $t('total') }}
          </div>
          <div class="summary-table-number">
            {{ fNum(fiatTotal, currency) }}
            <BalTooltip
              :text="$t('tooltips.invest.total')"
              icon-size="sm"
              class="ml-2"
            />
          </div>
        </div>
        <div class="summary-table-row">
          <div class="summary-table-label">
            {{ $t('priceImpact') }}
          </div>
          <div class="summary-table-number">
            {{ fNum(priceImpact, 'percent') }}
            <BalTooltip
              :text="$t('tooltips.invest.priceImpact')"
              icon-size="sm"
              width="72"
              class="ml-2"
            />
          </div>
        </div>
        <div class="summary-table-row">
          <div class="summary-table-label">
            Potential weekly yield
          </div>
          <div class="summary-table-number">
            $0.00
            <BalTooltip icon-size="sm" width="72" class="ml-2" noPad>
              <div class="p-2 bg-gray-50 border-b">
                <span class="text-sm">Yield earnings</span>
                <span class="ml-1 text-gray-500">(based on the last 24h)</span>
                <div class="text-base font-semibold mt-1">
                  $X.XX per week
                </div>
              </div>
              <div class="p-2">
                <BalStatBreakdown :items="lmBreakdown">
                  <div class="flex items-center">
                    <span>$X.XX</span>
                    <span class="ml-1 text-gray-500">Liquidity mining</span>
                    <StarsIcon class="h-4 text-yellow-300" />
                  </div>
                  <template v-slot:item="{ item }">
                    {{ fNum(item.amount, currency) }}
                    {{ item.symbol }}
                  </template>
                </BalStatBreakdown>
              </div>
            </BalTooltip>
          </div>
        </div>
      </div>
    </div>
    <BalBtn
      color="gradient"
      class="mt-4"
      :disabled="submitting"
      :loading="submitting"
      :loading-label="$t('confirming')"
      block
      @click="emit('invest')"
    >
      {{ $t('invest') }}
    </BalBtn>
  </BalModal>
</template>

<style scoped>
.token-input-table {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}

.token-input-table-content {
  @apply p-3 flex items-center;
}

.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}

.summary-table-row {
  @apply grid grid-cols-2 flex items-center px-2 py-1;
}

.summary-table-label {
  @apply flex items-center;
}

.summary-table-number {
  @apply flex items-center justify-end;
}

.addition-separator {
  @apply absolute bottom-0 right-0 -mb-6 mr-6;
  @apply w-12 h-12 rounded-full bg-white dark:bg-gray-900 z-10;
  @apply border dark:border-gray-700;
  @apply flex items-center justify-center;
}
</style>
