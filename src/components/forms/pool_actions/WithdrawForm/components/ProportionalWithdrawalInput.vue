<script setup lang="ts">
import { toRefs, computed, ref, toRef } from 'vue';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { WithdrawMathResponse } from '../composables/useWithdrawMath';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import { usePool } from '@/composables/usePool';

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
const sliderValue = ref(0);

/**
 * COMPOSABLES
 */
const {
  bptIn,
  bptBalance,
  fiatTotalLabel,
  fiatAmounts,
  fullAmounts,
  proportionalMaxes
} = toRefs(props.math);

const { missingPrices } = usePoolTransfers();
const { getTokens } = useTokens();
const { isStableLikePool, tokenWeights } = usePool(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const tokens = computed(() => getTokens(props.tokenAddresses));

const percentageLabel = computed(() => {
  try {
    return bnum(bptIn.value)
      .div(bptBalance.value)
      .times(100)
      .integerValue(BigNumber.ROUND_CEIL);
  } catch (error) {
    console.error(error);
    return '0';
  }
});
</script>

<template>
  <div>
    <div class="p-4 border-t dark:border-gray-900">
      <div class="border dark:border-gray-900 rounded-lg shadow-inner p-2">
        <div
          class="flex items-center justify-between mb-3 text-sm text-gray-600"
        >
          <span v-text="$t('amountToWithdraw')" />
          <span>{{ percentageLabel }}%</span>
        </div>
        <div class="flex items-end">
          <span class="mr-2 text-lg font-medium w-1/2 leading-none break-words">
            {{ missingPrices ? '-' : fiatTotalLabel }}
          </span>
          <BalRangeInput
            class="w-1/2"
            v-model="sliderValue"
            :max="1000"
            :interval="1"
            :min="0"
            tooltip="none"
          />
        </div>
      </div>
    </div>

    <div
      class="px-4 py-3 bg-gray-50 dark:bg-gray-850 border-t dark:border-gray-900 border-b"
    >
      <div
        v-for="(token, address, i) in tokens"
        :key="address"
        class="py-3 last:mb-0"
      >
        <div class="flex items-center justify-between">
          <div class="w-1/2 flex items-center">
            <BalAsset :address="address" class="mr-2" />
            <div class="w-3/4 flex flex-col leading-none">
              <span class="break-words">
                {{ fNum(fullAmounts[i], 'token') }}
                {{ token.symbol }}
              </span>
              <span class="text-xs text-gray-400 break-words">
                {{ $t('balance') }}: {{ fNum(proportionalMaxes[i], 'token') }}
              </span>
            </div>
          </div>
          <div class="w-1/2 flex flex-col leading-none text-right pl-2">
            <span class="break-words">
              {{ fNum(fiatAmounts[i], 'usd') }}
            </span>
            <span v-if="!isStableLikePool" class="text-xs text-gray-400">
              {{ fNum(tokenWeights[i], 'percent_lg') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
