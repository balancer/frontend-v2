<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import TradePairToggle from './TradePairToggle.vue';
import { bnum } from '@/lib/utils';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  tokenInAmount: string;
  tokenInAddress: string;
  tokenOutAmount: string;
  tokenOutAddress: string;
  exactIn: boolean;
  priceImpact: number;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:tokenInAmount', value: string): void;
  (e: 'update:tokenInAddress', value: string): void;
  (e: 'update:tokenOutAmount', value: string): void;
  (e: 'update:tokenOutAddress', value: string): void;
  (e: 'update:exactIn', value: boolean): void;
  (e: 'amountChange'): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { getToken } = useTokens();

/**
 * STATE
 */
const _tokenInAmount = ref<string>('');
const _tokenInAddress = ref<string>('');
const _tokenOutAmount = ref<string>('');
const _tokenOutAddress = ref<string>('');

const isInRate = ref<boolean>(true);

/**
 * COMPUTED
 */
const missingToken = computed(
  () => !_tokenInAddress.value || !_tokenOutAddress.value
);

const missingAmount = computed(
  () => !_tokenInAmount.value || !_tokenOutAmount.value
);

const tokenIn = computed(() => getToken(_tokenInAddress.value));
const tokenOut = computed(() => getToken(_tokenOutAddress.value));

const rateLabel = computed(() => {
  if (missingToken.value || missingAmount.value) return '';
  const rate = isInRate.value
    ? bnum(_tokenOutAmount.value)
        .div(_tokenInAmount.value)
        .toString()
    : bnum(_tokenInAmount.value)
        .div(_tokenOutAmount.value)
        .toString();
  const inSymbol = isInRate.value
    ? tokenIn.value.symbol
    : tokenOut.value.symbol;
  const outSymbol = isInRate.value
    ? tokenOut.value.symbol
    : tokenIn.value.symbol;

  return `1 ${inSymbol} = ${fNum(rate, 'token')} ${outSymbol}`;
});

/**
 * METHODS
 */
function handleInAmountChange(value: string): void {
  emit('update:exactIn', true);
  emit('update:tokenInAmount', value);
  emit('amountChange');
}

function handleOutAmountChange(value: string): void {
  emit('update:exactIn', false);
  emit('update:tokenOutAmount', value);
  emit('amountChange');
}

function handleTokenSwitch(): void {
  emit('update:exactIn', !props.exactIn);
  emit('update:tokenInAmount', _tokenOutAmount.value);
  emit('update:tokenInAddress', _tokenOutAddress.value);
  emit('update:tokenOutAmount', _tokenInAmount.value);
  emit('update:tokenOutAddress', _tokenInAddress.value);
  emit('amountChange');
}

/**
 * CALLBACKS
 */
watchEffect(() => {
  _tokenInAmount.value = props.tokenInAmount;
  _tokenInAddress.value = props.tokenInAddress;
  _tokenOutAmount.value = props.tokenOutAmount;
  _tokenOutAddress.value = props.tokenOutAddress;
});
</script>

<template>
  <div>
    <TokenInput
      v-model:amount="_tokenInAmount"
      v-model:address="_tokenInAddress"
      name="tokenIn"
      @update:amount="handleInAmountChange"
      @update:address="emit('update:tokenInAddress', $event)"
    />

    <div class="flex items-center my-2">
      <TradePairToggle @toggle="handleTokenSwitch" />
      <div class="h-px mx-2 bg-gray-100 dark:bg-gray-700 flex-grow" />
      <div
        v-if="rateLabel"
        class="flex items-center text-xs text-gray-500 cursor-pointer"
        @click="isInRate = !isInRate"
        v-text="rateLabel"
      />
    </div>

    <TokenInput
      v-model:amount="_tokenOutAmount"
      v-model:address="_tokenOutAddress"
      name="tokenOut"
      :priceImpact="priceImpact"
      @update:amount="handleOutAmountChange"
      @update:address="emit('update:tokenOutAddress', $event)"
      noRules
      noMax
    />
  </div>
</template>
