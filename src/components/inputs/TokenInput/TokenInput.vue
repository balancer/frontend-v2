<script setup lang="ts">
import { HtmlInputEvent } from '@/types';
import { ref, computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';

import { bnum } from '@/lib/utils';
import { isPositive, isLessThanOrEqualTo } from '@/lib/utils/validations';

import useWeb3 from '@/services/web3/useWeb3';

import { Rules } from '@/components/_global/BalTextInput/BalTextInput.vue';
import TokenSelectInput from '@/components/inputs/TokenSelectInput/TokenSelectInput.vue';

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
  hint?: string;
  hintAmount?: string;
  excludedTokens?: string[];
  options?: string[];
  rules?: Rules;
  disableNativeAssetBuffer?: boolean;
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
  hintAmount: '',
  disableNativeAssetBuffer: false,
  options: () => [],
  rules: () => []
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
 * STATE
 */
const _amount = ref<InputValue>('');
const _address = ref<string>('');

/**
 * COMPOSABLEs
 */

const { getToken, balanceFor, nativeAsset } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { t } = useI18n();
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!_address.value);
const amountBN = computed(() => bnum(_amount.value));
const tokenBalanceBN = computed(() => bnum(tokenBalance.value));
const hasAmount = computed(() => amountBN.value.gt(0));
const hasBalance = computed(() => tokenBalanceBN.value.gt(0));
const shouldUseTxBuffer = computed(
  () =>
    _address.value === nativeAsset.address && !props.disableNativeAssetBuffer
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
      _amount.value ===
      tokenBalanceBN.value.minus(nativeAsset.minTransactionBuffer).toString()
    );
  } else {
    return _amount.value === tokenBalance.value;
  }
});

const tokenBalance = computed(() => {
  if (props.customBalance) return props.customBalance;
  return balanceFor(_address.value);
});

const token = computed((): TokenInfo | undefined => {
  if (!hasToken.value) return undefined;
  return getToken(_address.value);
});

const tokenValue = computed(() => {
  return toFiat(_amount.value, _address.value);
});

const inputRules = computed(() => {
  if (!hasToken.value || !isWalletReady.value || props.noRules)
    return [isPositive()];
  return [
    ...props.rules,
    isPositive(),
    isLessThanOrEqualTo(tokenBalance.value, t('exceedsBalance'))
  ];
});

const maxPercentage = computed(() => {
  if (!hasBalance.value || !hasAmount.value) return '0';

  return amountBN.value
    .div(tokenBalance.value)
    .times(100)
    .toFixed(2);
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

const priceImpactSign = computed(() =>
  (props.priceImpact || 0) >= 0 ? '-' : '+'
);

const priceImpactClass = computed(() =>
  (props.priceImpact || 0) >= 0.01 ? 'text-red-500' : ''
);

/**
 * METHODS
 */
const setMax = () => {
  if (props.disableMax) return;

  if (
    _address.value === nativeAsset.address &&
    !props.disableNativeAssetBuffer
  ) {
    // Subtract buffer for gas
    _amount.value = tokenBalanceBN.value.gt(nativeAsset.minTransactionBuffer)
      ? tokenBalanceBN.value.minus(nativeAsset.minTransactionBuffer).toString()
      : '0';
  } else {
    _amount.value = tokenBalance.value;
  }

  emit('update:amount', _amount.value);
};

/**
 * CALLBACKS
 */
watchEffect(() => {
  _amount.value = props.amount;
  _address.value = props.address;
});
</script>

<template>
  <BalTextInput
    v-model="_amount"
    :placeholder="hintAmount || '0.0'"
    type="number"
    :label="label"
    :decimalLimit="token?.decimals || 18"
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
    @update:modelValue="emit('update:amount', $event)"
    @update:isValid="emit('update:isValid', $event)"
    @keydown="emit('keydown', $event)"
  >
    <template #prepend>
      <slot name="tokenSelect">
        <TokenSelectInput
          v-model="_address"
          :weight="weight"
          :fixed="fixedToken"
          :options="options"
          class="mr-2"
          @update:modelValue="emit('update:address', $event)"
          :excludedTokens="excludedTokens"
        />
      </slot>
    </template>
    <template #footer>
      <div
        v-if="isWalletReady || (hasAmount && hasToken)"
        class="flex flex-col pt-1"
      >
        <div
          class="flex items-center justify-between text-sm text-gray-500 leading-none"
        >
          <div v-if="!isWalletReady" />
          <div v-else class="cursor-pointer" @click="setMax">
            {{ balanceLabel ? balanceLabel : $t('balance') }}:
            <span class="mr-2">
              {{ fNum(tokenBalance, 'token') }}
            </span>
            <template v-if="hasBalance && !noMax && !disableMax">
              <span v-if="!isMaxed" class="text-blue-500">
                {{ $t('max') }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-600 lowercase">
                {{ $t('maxed') }}
              </span>
            </template>
          </div>
          <div>
            <template v-if="hasAmount && hasToken">
              {{ fNum(tokenValue, currency) }}
              <span v-if="priceImpact" :class="priceImpactClass">
                ({{ priceImpactSign + fNum(priceImpact, 'percent') }})
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
          :buffer-width="bufferPercentage"
          :color="barColor"
          class="mt-2"
        />
        <div
          v-if="shouldShowTxBufferMessage"
          class="mt-2 text-yellow-600 dark:text-yellow-400 text-xs"
        >
          {{
            t('minTransactionBuffer', [
              nativeAsset.minTransactionBuffer,
              nativeAsset.symbol
            ])
          }}
        </div>
      </div>
    </template>
  </BalTextInput>
</template>
