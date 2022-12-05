<script setup lang="ts">
import BigNumber from 'bignumber.js';
import { computed, onBeforeMount, reactive, watch } from 'vue';
import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { Pool, PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import useExitPool from '@/composables/pools/useExitPool';
import { useI18n } from 'vue-i18n';
import ProportionalWithdrawalTokenInfoV2 from './ProportionalWithdrawalTokenInfoV2.vue';

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
  fiatTotalOut,
} = useExitPool();
const { t } = useI18n();

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
      :tokenValue="fiatTotalOut"
      @update:amount="handleAmountChange"
      @update:slider="handleSliderChange"
    />
    <div class="label">{{ t('youReceive') }}</div>
    <div class="token-amounts">
      <ProportionalWithdrawalTokenInfoV2
        v-for="{ address, value } in propAmountsOut"
        :key="address"
        :token="selectByAddress(exitTokenInfo, address)"
        :weight="getPoolToken(address)?.weight || '0'"
        :address="address"
        :fiatAmountOut="selectByAddress(fiatAmountsOut, address)"
        :loading="isLoadingQuery"
        :pool="pool"
        :value="value"
        class="last:mb-0"
      />
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply mb-3 text-sm font-bold;
}

.token-amounts {
  @apply rounded-lg;
  @apply bg-gray-50 dark:bg-gray-800;
  @apply border dark:border-gray-900 divide-y dark:divide-gray-900;
}
</style>
