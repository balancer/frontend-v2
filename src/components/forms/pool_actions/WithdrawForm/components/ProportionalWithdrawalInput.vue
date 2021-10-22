<script setup lang="ts">
import { toRefs, computed, reactive, toRef, watch, ref } from 'vue';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { WithdrawMathResponse } from '../composables/useWithdrawMath';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import { usePool } from '@/composables/usePool';
import useNumbers from '@/composables/useNumbers';
import WithdrawalTokenSelect from './WithdrawalTokenSelect.vue';
import { TokenInfo } from '@gnosis.pm/safe-apps-sdk';

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
 * STATE
 */
const slider = reactive({
  val: 1000,
  max: 1000,
  min: 0,
  interval: 1
});

/**
 * COMPOSABLES
 */
const {
  bptIn,
  bptBalance,
  fiatTotalLabel,
  fiatAmounts,
  fullAmounts,
  proportionalMaxes,
  proportionalAmounts
} = toRefs(props.math);

const { missingPrices } = usePoolTransfers();
const { getTokens } = useTokens();
const { isStableLikePool } = usePool(toRef(props, 'pool'));
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const tokens = computed(() => getTokens(props.tokenAddresses));

const percentageLabel = computed(() => {
  try {
    return bnum(bptIn.value)
      .div(bptBalance.value)
      .times(100)
      .integerValue(BigNumber.ROUND_CEIL)
      .toString();
  } catch (error) {
    console.error(error);
    return '0';
  }
});

const tokenWeights = computed((): number[] =>
  Object.values(props.pool.onchain.tokens).map(token => token.weight)
);

/**
 * METHODS
 */
function handleSliderChange(newVal: number): void {
  const fractionBasisPoints = (newVal / slider.max) * 10000;
  bptIn.value = bnum(bptBalance.value)
    .times(fractionBasisPoints)
    .div(10000)
    .toFixed(props.pool.onchain.decimals);
}
</script>

<template>
  <div>
    <div class="proportional-input">
      <div class="shadow-inner p-4 rounded-lg">
        <div class="flex">
          <WithdrawalTokenSelect :tokenAddresses="pool.tokenAddresses" />
          <div class="flex-grow text-right text-xl">
            {{ missingPrices ? '-' : fiatTotalLabel }}
          </div>
        </div>
        <div class="flex">
          <span>Proportional withdrawal</span>
          <span class="flex-grow text-right">{{ percentageLabel }}%</span>
        </div>
        <BalRangeInput
          v-model="slider.val"
          :max="slider.max"
          :interval="slider.interval"
          :min="slider.min"
          tooltip="none"
          @update:modelValue="handleSliderChange"
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
            <div class="w-3/4 flex flex-col leading-none">
              <span class="text-lg font-medium">
                {{ token.symbol }}
                <span v-if="!isStableLikePool">
                  {{ fNum(tokenWeights[i], 'percent_lg') }}
                </span>
              </span>
            </div>
          </div>
          <div class="flex flex-col flex-grow text-right pl-2">
            <span class="break-words text-xl">
              {{ fNum(proportionalAmounts[i], 'token') }}
            </span>
            <span class="text-sm text-gray-400">
              {{ fNum(fiatAmounts[i], 'usd') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proportional-input {
  @apply shadow-lg rounded-lg mb-4 w-full;
}

.token-amounts {
  @apply rounded-lg mb-4;
  @apply bg-gray-50 dark:bg-gray-850;
  @apply border dark:border-gray-900 divide-y;
}
</style>
