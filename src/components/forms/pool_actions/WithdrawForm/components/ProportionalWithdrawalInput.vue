<script setup lang="ts">
import { toRefs, computed, toRef, onBeforeMount, watch } from 'vue';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfoMap } from '@/types/TokenList';
// Composables
import useNumbers from '@/composables/useNumbers';
import { isStablePhantom, usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { WithdrawMathResponse } from '../composables/useWithdrawMath';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import useWeb3 from '@/services/web3/useWeb3';
import useWithdrawalState from '../composables/useWithdrawalState';
// Components
import WithdrawalTokenSelect from './WithdrawalTokenSelect.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  tokenAddresses: string[];
  math: WithdrawMathResponse;
};

/**
 * Props
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const {
  propBptIn,
  bptBalance,
  hasBpt,
  fiatTotalLabel,
  fiatAmounts,
  proportionalAmounts,
  shouldFetchBatchSwap,
  loadingAmountsOut
} = toRefs(props.math);

const { slider } = useWithdrawalState(toRef(props, 'pool'));

const { isWalletReady } = useWeb3();
const { missingPrices } = usePoolTransfers();
const { getTokens } = useTokens();
const { isStableLikePool } = usePool(toRef(props, 'pool'));
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const tokens = computed(
  (): TokenInfoMap => {
    if (isStablePhantom(props.pool.poolType)) {
      return getTokens(props.pool.mainTokens || []);
    }
    return getTokens(props.pool.tokenAddresses);
  }
);

const percentageLabel = computed(() => {
  try {
    if (!hasBpt.value) return '100';

    return bnum(propBptIn.value)
      .div(bptBalance.value)
      .times(100)
      .integerValue(BigNumber.ROUND_CEIL)
      .toString();
  } catch (error) {
    console.error(error);
    return '0';
  }
});

const seedTokens = computed((): number[] =>
  Object.values(props.pool.onchain.tokens).map(token => token.weight)
);

/**
 * METHODS
 */
function handleSliderChange(newVal: number): void {
  const fractionBasisPoints = (newVal / slider.value.max) * 10000;
  propBptIn.value = bnum(bptBalance.value)
    .times(fractionBasisPoints)
    .div(10000)
    .toFixed(props.pool.onchain.decimals);
}

async function handleSliderEnd(): Promise<void> {
  if (shouldFetchBatchSwap.value) {
    await props.math.getSwap();
  }
}

/**
 * WATCHERS
 */
watch(isWalletReady, () => {
  propBptIn.value = bptBalance.value;
});

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  propBptIn.value = bptBalance.value;
});
</script>

<template>
  <div>
    <div class="proportional-input">
      <div class="proportional-input-container">
        <div class="flex">
          <WithdrawalTokenSelect :pool="pool" />
          <div class="flex-grow text-right text-xl font-numeric">
            <BalLoadingBlock
              v-if="loadingAmountsOut"
              class="w-20 h-8 float-right"
            />
            <span v-else>{{ missingPrices ? '-' : fiatTotalLabel }}</span>
          </div>
        </div>
        <div class="flex mt-2 text-sm text-gray-500">
          <span>
            {{ $t('proportionalWithdrawal') }}
          </span>
          <span class="flex-grow text-right">{{ percentageLabel }}%</span>
        </div>
        <BalRangeInput
          v-model="slider.val"
          :max="slider.max"
          :interval="slider.interval"
          :min="slider.min"
          tooltip="none"
          :disabled="!hasBpt"
          @update:modelValue="handleSliderChange"
          @dragEnd="handleSliderEnd"
        />
      </div>
    </div>

    <div class="token-amounts">
      <div
        v-for="(token, address, i) in tokens"
        :key="address"
        class="p-4 last:mb-0"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <BalAsset :address="address" class="mr-2" />
            <div class="flex flex-col leading-none">
              <span class="text-lg font-medium">
                {{ token.symbol }}
                <span v-if="!isStableLikePool">
                  {{
                    fNum2(seedTokens[i], {
                      style: 'unit',
                      unit: 'percent',
                      maximumFractionDigits: 0
                    })
                  }}
                </span>
              </span>
            </div>
          </div>
          <div
            class="flex flex-col flex-grow items-end text-right pl-2 font-numeric"
          >
            <BalLoadingBlock v-if="loadingAmountsOut" class="w-20 h-12" />
            <template v-else>
              <span class="break-words text-xl">
                {{ fNum2(proportionalAmounts[i], FNumFormats.token) }}
              </span>
              <span class="text-sm text-gray-400">
                {{ fNum2(fiatAmounts[i], FNumFormats.fiat) }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proportional-input {
  @apply shadow-lg rounded-lg mb-4 w-full dark:bg-gray-800;
}

.proportional-input-container {
  @apply shadow-inner p-3 pb-1 rounded-lg;
  @apply border border-gray-100 dark:border-gray-800;
}

.token-amounts {
  @apply rounded-lg;
  @apply bg-gray-50 dark:bg-gray-800;
  @apply border dark:border-gray-900 divide-y dark:divide-gray-900;
}
</style>
