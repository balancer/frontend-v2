<script setup lang="ts">
import { HtmlInputEvent } from '@/types';
import { ref, computed, watchEffect } from 'vue';
import useTokens from '@/composables/useTokens';
import TokenSelectInput from '@/components/inputs/TokenSelectInput/TokenSelectInput.vue';
import useNumbers from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import useUserSettings from '@/composables/useUserSettings';
import { isPositive, isLessThanOrEqualTo } from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type InputValue = string | number;

type Props = {
  amount: InputValue;
  address?: string;
  weight?: number;
  noRules?: boolean;
  noMax?: boolean;
  priceImpact?: number;
  label?: string;
  fixedToken?: boolean;
  customBalance?: string;
  disableMax?: boolean;
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
  disableMax: false
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
const ETH_BUFFER = 0.1;

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
const hasAmount = computed(() => bnum(_amount.value).gt(0));
const hasBalance = computed(() => bnum(tokenBalance.value).gt(0));
const isMaxed = computed(() => _amount.value === tokenBalance.value);

const tokenBalance = computed(() => {
  if (props.customBalance) return props.customBalance;
  return balanceFor(_address.value);
});

const token = computed(() => {
  if (!hasToken.value) return {};
  return getToken(_address.value);
});

const tokenValue = computed(() => {
  return toFiat(_amount.value, _address.value);
});

const rules = computed(() => {
  if (!hasToken.value || !isWalletReady.value || props.noRules)
    return [isPositive()];
  return [
    isPositive(),
    isLessThanOrEqualTo(tokenBalance.value, t('exceedsBalance'))
  ];
});

const maxPercentage = computed(() => {
  if (!hasBalance.value || !hasAmount.value) return '0';

  return bnum(_amount.value)
    .div(tokenBalance.value)
    .times(100)
    .toFixed(1);
});

const barColor = computed(() => {
  if (bnum(_amount.value).gt(tokenBalance.value)) return 'red';
  return 'green';
});

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

  if (_address.value === nativeAsset.address) {
    // Subtract buffer for gas
    _amount.value = bnum(tokenBalance.value).gt(ETH_BUFFER)
      ? bnum(tokenBalance.value)
          .minus(ETH_BUFFER)
          .toString()
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
    placeholder="0.0"
    type="number"
    :label="label"
    :decimalLimit="token?.decimals || 18"
    :rules="rules"
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
    <template v-slot:prepend>
      <TokenSelectInput
        v-model="_address"
        :fixed="fixedToken"
        :weight="weight"
        class="mr-2"
        @update:modelValue="emit('update:address', $event)"
      />
    </template>
    <template v-slot:footer>
      <div
        v-if="isWalletReady || (hasAmount && hasToken)"
        class="flex flex-col pt-1"
      >
        <div
          class="flex items-center justify-between text-sm text-gray-500 leading-none"
        >
          <div v-if="!isWalletReady" />
          <div v-else class="cursor-pointer" @click="setMax">
            {{ $t('balance') }}:
            <span class="font-numeric mr-2">
              {{ fNum(tokenBalance, 'token') }}
            </span>
            <template v-if="hasBalance && !noMax && !disableMax">
              <span v-if="!isMaxed" class="text-blue-500 lowercase">
                {{ $t('max') }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-600 lowercase">
                {{ $t('maxed') }}
              </span>
            </template>
          </div>
          <div v-if="hasAmount && hasToken" class="font-numeric">
            {{ fNum(tokenValue, currency) }}
            <span v-if="priceImpact" :class="priceImpactClass">
              ({{ priceImpactSign + fNum(priceImpact, 'percent') }})
            </span>
          </div>
        </div>
        <BalProgressBar
          v-if="hasBalance && !noMax"
          :width="maxPercentage"
          :color="barColor"
          class="mt-2"
        />
      </div>
    </template>
  </BalTextInput>
</template>
