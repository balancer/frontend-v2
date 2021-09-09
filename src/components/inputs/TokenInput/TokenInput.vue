<script lang="ts">
// https://v3.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { HtmlInputEvent } from '@/types';
import { onBeforeMount, ref, computed } from 'vue';
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
  modelValue: InputValue;
  address?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  address: ''
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
  (e: 'input', value: string): void;
  (e: 'update:modelValue', value: string): void;
  (e: 'update:isValid', value: boolean): void;
  (e: 'keydown', value: HtmlInputEvent);
}>();

/**
 * STATE
 */
const amount = ref<InputValue>('');
const tokenAddress = ref<string>('');

/**
 * COMPOSABLEs
 */
const { getToken, balanceFor, priceFor } = useTokens();
const { fNum } = useNumbers();
const { currency } = useUserSettings();
const { t } = useI18n();
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!tokenAddress.value);
const hasAmount = computed(() => bnum(amount.value).gt(0));
const tokenBalance = computed(() => balanceFor(tokenAddress.value));
const hasBalance = computed(() => bnum(tokenBalance.value).gt(0));
const isMaxed = computed(() => amount.value === tokenBalance.value);

const token = computed(() => {
  if (!hasToken.value) return {};
  return getToken(tokenAddress.value);
});

const tokenValue = computed(() => {
  const price = priceFor(tokenAddress.value);
  return bnum(price)
    .times(amount.value)
    .toString();
});

const rules = computed(() => {
  if (!hasToken.value || !isWalletReady.value) return [isPositive()];
  return [
    isPositive(),
    isLessThanOrEqualTo(tokenBalance.value, t('exceedsBalance'))
  ];
});

/**
 * METHODS
 */
const setMax = () => {
  amount.value = tokenBalance.value;
  emit('update:modelValue', amount.value);
};

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  amount.value = props.modelValue;
  tokenAddress.value = props.address;
});
</script>

<template>
  <BalTextInput2
    v-model="amount"
    placeholder="0.0"
    type="number"
    :decimalLimit="token?.decimals || 18"
    :rules="rules"
    validateOn="input"
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
    v-bind="$attrs"
    inputAlignRight
    @blur="emit('blur', $event)"
    @input="emit('input', $event)"
    @update:modelValue="emit('update:modelValue', $event)"
    @update:isValid="emit('update:isValid', $event)"
    @keydown="emit('keydown', $event)"
  >
    <template v-slot:prepend>
      <TokenSelectInput v-model="tokenAddress" class="mr-2" />
    </template>
    <template v-slot:footer>
      <div class="flex flex-col pt-1">
        <div
          class="flex items-center justify-between text-sm text-gray-500 leading-none"
        >
          <div v-if="!hasBalance">{{ $t('balance') }}: 0</div>
          <div v-else class="cursor-pointer" @click="setMax">
            {{ $t('balance') }}:
            {{ fNum(tokenBalance, 'token') }}
            {{ token?.symbol }}
            <span v-if="!isMaxed" class="text-blue-500 lowercase">
              {{ $t('max') }}
            </span>
            <span v-else class="text-gray-400 dark:text-gray-600 lowercase">
              {{ $t('maxed') }}
            </span>
          </div>
          <div v-if="hasAmount && hasToken">
            {{ fNum(tokenValue, currency) }}
          </div>
        </div>
      </div>
    </template>
  </BalTextInput2>
</template>
