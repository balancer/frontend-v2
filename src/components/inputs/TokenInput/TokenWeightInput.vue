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
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type InputValue = string | number;

type Props = {
  address?: string;
  weight?: number;
  label?: string;
  fixedToken?: boolean;
  hint?: string;
  hintAmount?: string;
  excludedTokens?: string[];
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  address: '',
  weight: 0,
  hintAmount: ''
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
  (e: 'input', value: string): void;
  (e: 'update:weight', value: string): void;
  (e: 'update:address', value: string): void;
  (e: 'update:isValid', value: boolean): void;
  (e: 'keydown', value: HtmlInputEvent);
}>();

/**
 * STATE
 */
const _weight = ref<InputValue>('');
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
const hasWeight = computed(() => bnum(_weight.value).gt(0));

const token = computed((): TokenInfo | undefined => {
  if (!hasToken.value) return undefined;
  return getToken(_address.value);
});

const rules = computed(() => {
  if (!hasToken.value || !isWalletReady.value) return [isPositive()];
  return [isPositive()];
});

/**
 * METHODS
 */

/**
 * CALLBACKS
 */
watchEffect(() => {
  _weight.value = props.weight;
  _address.value = props.address;
});
</script>

<template>
  <BalTextInput
    v-model="_weight"
    :placeholder="hintAmount || '0.0'"
    type="string"
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
    @update:modelValue="emit('update:weight', $event)"
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
        :excludedTokens="excludedTokens"
      />
    </template>
    <template v-slot:footer>
      <div
        v-if="isWalletReady || (hasWeight && hasToken)"
        class="flex flex-col pt-1"
      >
        <div
          class="flex items-center justify-between text-sm text-gray-500 leading-none"
        >
          <div>
            <template v-if="hasWeight && hasToken"> </template>
            <template v-else-if="hint">
              <span
                class="text-blue-500 lowercase cursor-pointer"
                @click="emit('update:weight', hintAmount)"
              >
                {{ hint }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </template>
  </BalTextInput>
</template>
