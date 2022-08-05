<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Rules } from '@/components/_global/BalTextInput/BalTextInput.vue';
import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import TokenSelectInput from '@/components/inputs/TokenSelectInput/TokenSelectInput.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { isLessThanOrEqualTo, isPositive } from '@/lib/utils/validations';
import useWeb3 from '@/services/web3/useWeb3';
import { HtmlInputEvent } from '@/types';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type InputValue = string | number;

type Props = {
  amount: InputValue;
  address?: string;
  weight?: number | string;
  noRules?: boolean;
  noMax?: boolean;
  priceImpact?: number;
  label?: string;
  fixedToken?: boolean;
  customBalance?: string;
  balanceLabel?: string;
  disableMax?: boolean;
  disableBalance?: boolean;
  balanceLoading?: boolean;
  hint?: string;
  hintAmount?: string;
  excludedTokens?: string[];
  options?: string[];
  rules?: Rules;
  disableNativeAssetBuffer?: boolean;
  hideFooter?: boolean;
  ignoreWalletBalance?: boolean;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  tokenValue?: string;
  placeholder?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  amount: '',
  address: '',
  weight: 0,
  noRules: false,
  noMax: false,
  fixedToken: false,
  disableMax: false,
  disableBalance: false,
  balanceLoading: false,
  hintAmount: '',
  disableNativeAssetBuffer: false,
  hideFooter: false,
  ignoreWalletBalance: false,
  options: () => [],
  rules: () => [],
  priceImpact: 0,
  label: '',
  customBalance: '',
  balanceLabel: '',
  hint: '',
  excludedTokens: () => [],
  placeholder: '',
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
  (e: 'input', value: string): void;
  (e: 'update:amount', value: string): void;
  (e: 'update:address', value: string): void;
  (e: 'update:isValid', value: boolean): void;
  (e: 'keydown', value: HtmlInputEvent);
}>();

/**
 * COMPOSABLEs
 */
const { getToken, balanceFor, nativeAsset } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { t } = useI18n();
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!props.address);
const amountBN = computed(() => bnum(props.amount));
const tokenBalanceBN = computed(() => bnum(tokenBalance.value));
const hasAmount = computed(() => amountBN.value.gt(0));
const hasBalance = computed(() => tokenBalanceBN.value.gt(0));
const shouldUseTxBuffer = computed(
  () => props.address === nativeAsset.address && !props.disableNativeAssetBuffer
);
const amountExceedsTokenBalance = computed(() =>
  amountBN.value.gt(tokenBalance.value)
);
const shouldShowTxBufferMessage = computed(() => {
  if (
    amountExceedsTokenBalance.value ||
    !shouldUseTxBuffer.value ||
    !hasBalance.value ||
    !hasAmount.value
  ) {
    return false;
  }

  return amountBN.value.gte(
    tokenBalanceBN.value.minus(nativeAsset.minTransactionBuffer)
  );
});

const isMaxed = computed(() => {
  if (shouldUseTxBuffer.value) {
    return (
      props.amount ===
      tokenBalanceBN.value.minus(nativeAsset.minTransactionBuffer).toString()
    );
  } else {
    return props.amount === tokenBalance.value;
  }
});

const tokenBalance = computed(() => {
  if (props.customBalance) return props.customBalance;
  return balanceFor(props.address);
});

const token = computed((): TokenInfo | undefined => {
  if (!hasToken.value) return undefined;
  return getToken(props.address);
});

const tokenValue = computed(() => {
  return props.tokenValue ?? toFiat(props.amount, props.address);
});

const inputRules = computed(() => {
  if (!hasToken.value || !isWalletReady.value || props.noRules) {
    return [isPositive()];
  }

  const rules = [...props.rules, isPositive()];
  if (!props.ignoreWalletBalance) {
    rules.push(isLessThanOrEqualTo(tokenBalance.value, t('exceedsBalance')));
  }
  return rules;
});

const maxPercentage = computed(() => {
  if (!hasBalance.value || !hasAmount.value) return '0';

  return amountBN.value.div(tokenBalance.value).times(100).toFixed(2);
});

const bufferPercentage = computed(() => {
  if (!shouldShowTxBufferMessage.value) return '0';

  return bnum(nativeAsset.minTransactionBuffer)
    .div(tokenBalance.value)
    .times(100)
    .toFixed(2);
});

const barColor = computed(() =>
  amountExceedsTokenBalance.value ? 'red' : 'green'
);

const priceImpactSign = computed(() => (props.priceImpact >= 0 ? '-' : '+'));

const priceImpactClass = computed(() =>
  props.priceImpact >= 0.01 ? 'text-red-500' : ''
);

const decimalLimit = computed<number>(() => token.value?.decimals || 18);

function getSafeAmount(amount: InputValue, decimalLimit: number) {
  return overflowProtected(amount, decimalLimit);
}

function handleAmountChange(amount: InputValue) {
  const safeAmount = getSafeAmount(amount, decimalLimit.value);

  emit('update:amount', safeAmount);
}

watch(
  () => props.address,
  async (newVal, oldVal) => {
    // If token address changes, we have to calculate new safe value based on new token's decimals
    if (newVal !== oldVal) {
      // wait for the token's decimals to be updated
      await nextTick();
      handleAmountChange(props.amount);
    }
  }
);

/**
 * METHODS
 */
const setMax = () => {
  if (props.disableMax) return;
  let _amount;
  if (
    props.address === nativeAsset.address &&
    !props.disableNativeAssetBuffer
  ) {
    // Subtract buffer for gas
    _amount = tokenBalanceBN.value.gt(nativeAsset.minTransactionBuffer)
      ? tokenBalanceBN.value.minus(nativeAsset.minTransactionBuffer).toString()
      : '0';
  } else {
    _amount = tokenBalance.value;
  }

  handleAmountChange(_amount);
};
</script>

<template>
  <BalTextInput
    :modelValue="amount"
    :placeholder="placeholder || '0.0'"
    type="number"
    :label="label"
    :decimalLimit="decimalLimit"
    :rules="inputRules"
    validateOn="input"
    autocomplete="off"
    autocorrect="off"
    step="any"
    spellcheck="false"
    v-bind="$attrs"
    inputAlignRight
    @blur="emit('blur', $event)"
    @input="emit('input', $event)"
    @update:model-value="handleAmountChange($event)"
    @update:is-valid="emit('update:isValid', $event)"
    @keydown="emit('keydown', $event)"
  >
    <template #prepend>
      <slot name="tokenSelect">
        <TokenSelectInput
          :modelValue="props.address"
          :weight="weight"
          :fixed="fixedToken"
          :options="options"
          class="mr-2"
          :excludedTokens="excludedTokens"
          @update:model-value="emit('update:address', $event)"
        />
      </slot>
    </template>
    <template v-if="!hideFooter" #footer>
      <div
        v-if="isWalletReady || (hasAmount && hasToken)"
        class="flex flex-col pt-1"
      >
        <div
          class="flex justify-between items-center text-sm leading-none text-gray-600 dark:text-gray-400"
        >
          <div v-if="!isWalletReady || disableBalance" />
          <div v-else class="flex items-center cursor-pointer" @click="setMax">
            {{ balanceLabel ? balanceLabel : $t('balance') }}:

            <BalLoadingBlock v-if="balanceLoading" class="mx-2 w-12 h-4" />
            <span v-else class="mx-1">
              {{ fNum2(tokenBalance, FNumFormats.token) }}
            </span>

            <template v-if="hasBalance && !noMax && !disableMax">
              <span
                v-if="!isMaxed"
                class="text-blue-600 hover:text-purple-600 focus:text-purple-600 dark:text-blue-400 dark:hover:text-yellow-500 dark:focus:text-yellow-500 transition-colors"
              >
                {{ $t('max') }}
              </span>
              <span
                v-else
                class="text-gray-400 dark:text-gray-600 cursor-not-allowed"
              >
                {{ $t('maxed') }}
              </span>
            </template>
          </div>
          <div>
            <template v-if="hasAmount && hasToken">
              {{ fNum2(tokenValue, FNumFormats.fiat) }}
              <span v-if="priceImpact" :class="priceImpactClass">
                ({{
                  priceImpactSign + fNum2(priceImpact, FNumFormats.percent)
                }})
              </span>
            </template>
            <template v-else-if="hint">
              <span
                class="text-blue-500 lowercase cursor-pointer"
                @click="emit('update:amount', hintAmount)"
              >
                {{ hint }}
              </span>
            </template>
          </div>
        </div>
        <BalProgressBar
          v-if="hasBalance && !noMax"
          :width="maxPercentage"
          :bufferWidth="bufferPercentage"
          :color="barColor"
          class="mt-2"
        />
        <div
          v-if="shouldShowTxBufferMessage"
          class="mt-2 text-xs text-orange-600 dark:text-orange-400"
        >
          {{
            t('minTransactionBuffer', [
              nativeAsset.minTransactionBuffer,
              nativeAsset.symbol,
            ])
          }}
        </div>
      </div>
    </template>
  </BalTextInput>
</template>
