<script setup lang="ts">
import BigNumber from 'bignumber.js';
import { computed, onBeforeMount, reactive, toRef, watch } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import { bnum, isSameAddress } from '@/lib/utils';
import { Pool, PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import useExitPool from '@/composables/pools/useExitPool';
import { useI18n } from 'vue-i18n';

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

const { isWalletReady } = useWeb3();
const {
  bptIn,
  bptInValid,
  bptBalance,
  hasBpt,
  isLoadingQuery,
  exitTokens,
  propAmountsOut,
  exitTokenInfo,
  fiatAmountsOut,
} = useExitPool();
const { t } = useI18n();
const { isStableLikePool } = usePool(toRef(props, 'pool'));
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const sliderProps = computed(() => {
  return {
    modelValue: slider.val,
    max: slider.max,
    interval: slider.interval,
    min: slider.min,
    tooltip: 'none',
    disabled: !hasBpt.value,
  };
});

/**
 * METHODS
 */
function handleSliderChange(newVal: number): void {
  const fractionBasisPoints = (newVal / slider.max) * 10000;
  bptIn.value = bnum(bptBalance.value)
    .times(fractionBasisPoints)
    .div(10000)
    .toFixed(props.pool.onchain?.decimals || 18);
}

function handleAmountChange(value: string): void {
  const percentageOfBalance = bnum(value)
    .div(bptBalance.value)
    .times(100)
    .integerValue(BigNumber.ROUND_CEIL);

  const sliderRangeScaled: number = percentageOfBalance.times(10).toNumber();

  if (sliderRangeScaled > slider.max) slider.val = slider.max;
  else if (sliderRangeScaled < slider.min) slider.val = slider.min;
  else slider.val = sliderRangeScaled;
}

function getPoolToken(address: string): PoolToken | undefined {
  return exitTokens.value.find(token => isSameAddress(token.address, address));
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
    <div class="label">{{ t('youProvide') }}</div>
    <TokenInput
      v-model:amount="bptIn"
      v-model:isValid="bptInValid"
      :address="pool.address"
      :name="pool.address"
      class="mb-4"
      fixedToken
      slider
      :sliderProps="sliderProps"
      @update:amount="handleAmountChange"
      @update:slider="handleSliderChange"
    />
    <div class="label">{{ t('youReceive') }}</div>
    <div class="token-amounts">
      <div
        v-for="{ address, value } in propAmountsOut"
        :key="address"
        class="p-4 last:mb-0"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <BalAsset :address="address" class="mr-2" />
            <div class="flex flex-col leading-none truncate">
              <div class="text-lg font-medium">
                {{ exitTokenInfo[address].symbol }}
                <span v-if="!isStableLikePool">
                  {{
                    fNum2(getPoolToken(address)?.weight || '0', {
                      style: 'percent',
                      maximumFractionDigits: 0,
                    })
                  }}
                </span>
              </div>
              <div class="flex w-52 text-sm text-gray-600 dark:text-gray-400">
                <span class="truncate">
                  {{ exitTokenInfo[address].name }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col flex-grow items-end pl-2 text-right font-numeric"
          >
            <BalLoadingBlock v-if="isLoadingQuery" class="w-20 h-12" />
            <template v-else>
              <span class="text-xl font-medium break-words">
                {{ fNum2(value, FNumFormats.token) }}
              </span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ fNum2(fiatAmountsOut[address], FNumFormats.fiat) }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply mb-3 text-sm font-bold;
}

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
