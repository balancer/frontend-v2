<script setup lang="ts">
import BigNumber from 'bignumber.js';
import { computed, onBeforeMount, reactive, toRef, watch } from 'vue';

import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
// Composables
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { bnum, isSameAddress } from '@/lib/utils';
// Types
import { Pool, PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import WithdrawalTokenSelectV2 from './WithdrawalTokenSelectV2.vue';
import useExitPool from '@/composables/pools/useExitPool';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
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
  interval: 1,
});

/**
 * COMPOSABLES
 */
const {
  bptIn,
  bptBalance,
  hasBpt,
  fiatTotalLabel,
  tokensOut,
  isLoadingQuery,
  poolTokens,
} = useExitPool();

const { isWalletReady } = useWeb3();
const { missingPrices } = usePoolTransfers();
const { getToken, priceFor } = useTokens();
const { isStableLikePool } = usePool(toRef(props, 'pool'));
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
// const tokenMetaMap = computed((): TokenInfoMap => {
//   return getTokens(Object.keys(tokensOut.value));
// });

const percentageLabel = computed(() => {
  try {
    if (!hasBpt.value) return '100';

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

/**
 * METHODS
 */
function handleSliderChange(newVal: number): void {
  const fractionBasisPoints = (newVal / slider.max) * 10000;
  bptIn.value = bnum(bptBalance.value)
    .times(fractionBasisPoints)
    .div(10000)
    .toFixed(props.pool?.onchain?.decimals || 18);
}

function getPoolToken(address: string): PoolToken | undefined {
  return poolTokens.value.find(token => isSameAddress(token.address, address));
}

function getFiatValue(address: string, amount: string): string {
  return bnum(priceFor(address)).times(amount).toString();
}

/**
 * WATCHERS
 */
watch(isWalletReady, () => {
  bptIn.value = bptBalance.value;
});

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  bptIn.value = bptBalance.value;
});
</script>

<template>
  <div>
    <div class="proportional-input">
      <div class="proportional-input-container">
        <div class="flex">
          <WithdrawalTokenSelectV2 :pool="pool" />
          <div class="flex-grow text-xl text-right font-numeric">
            <BalLoadingBlock
              v-if="isLoadingQuery"
              class="float-right w-20 h-8"
            />
            <span v-else>{{ missingPrices ? '-' : fiatTotalLabel }}</span>
          </div>
        </div>
        <div class="flex mt-2 text-sm text-secondary">
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
          @update:model-value="handleSliderChange"
        />
      </div>
    </div>

    <div class="token-amounts">
      <div
        v-for="(amount, address) in tokensOut"
        :key="address"
        class="p-4 last:mb-0"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <BalAsset :address="address" class="mr-2" />
            <div class="flex flex-col leading-none">
              <span class="text-lg font-medium">
                {{ getToken(address).symbol }}
                <span v-if="!isStableLikePool">
                  {{
                    fNum2(getPoolToken(address)?.weight || '0', {
                      style: 'percent',
                      maximumFractionDigits: 0,
                    })
                  }}
                </span>
              </span>
            </div>
          </div>
          <div
            class="flex flex-col flex-grow items-end pl-2 text-right font-numeric"
          >
            <BalLoadingBlock v-if="isLoadingQuery" class="w-20 h-12" />
            <template v-else>
              <span class="text-xl break-words">
                {{ fNum2(amount, FNumFormats.token) }}
              </span>
              <span class="text-sm text-gray-400">
                {{ fNum2(getFiatValue(address, amount), FNumFormats.fiat) }}
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
