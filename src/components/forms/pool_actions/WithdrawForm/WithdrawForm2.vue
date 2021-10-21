<script setup lang="ts">
import {
  reactive,
  toRef,
  computed,
  ref,
  nextTick,
  onBeforeMount,
  watch
} from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isStableLike, usePool } from '@/composables/usePool';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import useWithdrawMath from './composables/useWithdrawMath';
import { isRequired } from '@/lib/utils/validations';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped'
}

type Props = {
  pool: FullPool;
  useNativeAsset: boolean;
};

type FormState = {
  amounts: string[];
  tokenAddresses: string[];
  propAmounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:useNativeAsset', value: boolean): void;
}>();

/**
 * STATE
 */
const state = reactive<FormState>({
  amounts: [],
  tokenAddresses: [...props.pool.tokenAddresses],
  propAmounts: [],
  validInputs: [],
  highPriceImpactAccepted: false,
  submitting: false
});

const showInvestPreview = ref(false);
const isProportional = ref(false);

/**
 * COMPOSABLES
 */
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();

const withdrawMath = useWithdrawMath(
  toRef(props, 'pool'),
  toRef(state, 'tokenAddresses'),
  toRef(state, 'amounts'),
  toRef(props, 'useNativeAsset'),
  isProportional
);

const {
  hasAmounts,
  highPriceImpact,
  maximizeAmounts,
  optimizeAmounts,
  proportionalAmounts,
  maxAmounts
} = withdrawMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

const { managedPoolWithTradingHalted, isWethPool } = usePool(
  toRef(props, 'pool')
);

/**
 * COMPUTED
 */
const hasValidInputs = computed(
  (): boolean =>
    state.validInputs.every(validInput => validInput === true) &&
    hasAcceptedHighPriceImpact.value
);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? state.highPriceImpactAccepted : true
);

const forceProportionalInputs = computed(
  (): boolean => managedPoolWithTradingHalted.value || isProportional.value
);

const balanceLabel = computed(() =>
  isProportional.value ? 'Max' : 'Single asset max'
);

/**
 * METHODS
 */
function handleAmountChange(value: string, index: number): void {
  state.amounts[index] = value;

  nextTick(() => {
    if (forceProportionalInputs.value) {
      state.amounts = [...proportionalAmounts.value];
    }
  });
}

function tokenWeight(address: string): number {
  if (isStableLike(props.pool.poolType)) return 0;
  if (address === nativeAsset.address) {
    return props.pool.onchain.tokens[wrappedNativeAsset.value.address].weight;
  }

  return props.pool.onchain.tokens[address].weight;
}

function tokenOptions(index: number): string[] {
  return props.pool.tokenAddresses[index] === wrappedNativeAsset.value.address
    ? [wrappedNativeAsset.value.address, nativeAsset.address]
    : [];
}

// If ETH has a higher balance than WETH then use it for the input.
function setNativeAssetByBalance(): void {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  if (bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)) {
    setNativeAsset(NativeAsset.unwrapped);
  }
}

function setNativeAsset(to: NativeAsset): void {
  const fromAddress =
    to === NativeAsset.wrapped
      ? nativeAsset.address
      : wrappedNativeAsset.value.address;
  const toAddress =
    to === NativeAsset.wrapped
      ? wrappedNativeAsset.value.address
      : nativeAsset.address;

  const indexOfAsset = state.tokenAddresses.indexOf(fromAddress);

  if (indexOfAsset >= 0) {
    state.tokenAddresses[indexOfAsset] = toAddress;
  }
}

function resetForm(): void {
  state.amounts = state.amounts.map(() => '');
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (isWethPool.value) setNativeAssetByBalance();
});

/**
 * WATCHERS
 */
watch(state.tokenAddresses, newAddresses => {
  emit('update:useNativeAsset', newAddresses.includes(nativeAsset.address));
});

watch(
  () => props.useNativeAsset,
  shouldUseNativeAsset => {
    if (shouldUseNativeAsset) {
      setNativeAsset(NativeAsset.unwrapped);
    } else {
      setNativeAsset(NativeAsset.wrapped);
    }
  }
);

// watch(proportionalAmounts, newPropAmounts => {
//   console.log('maxPropAmounts', maxAmounts.value);
//   console.log('inputAmounts', state.amounts);
//   console.log('newPropAmounts', newPropAmounts);
//   if (isProportional.value && !isEqual(state.amounts, newPropAmounts)) {
//     console.log('change');
//     state.amounts = [...newPropAmounts];
//   }
// });

watch(isProportional, proportional => {
  if (!proportional) {
    resetForm();
  }
});
</script>

<template>
  <div>
    <BalToggle
      v-model="isProportional"
      name="isProportional"
      label="Withdraw proportionally for best price"
    />

    <ProportionalWithdrawalInput
      v-if="isProportional"
      :pool="pool"
      :tokenAddresses="state.tokenAddresses"
      :math="withdrawMath"
    />
    <TokenInput
      v-else
      v-for="(n, i) in state.tokenAddresses.length"
      :key="i"
      :name="state.tokenAddresses[i]"
      v-model:address="state.tokenAddresses[i]"
      v-model:amount="state.amounts[i]"
      v-model:isValid="state.validInputs[i]"
      :weight="tokenWeight(state.tokenAddresses[i])"
      :customBalance="maxAmounts[i]"
      :balanceLabel="balanceLabel"
      class="my-4"
      fixedToken
      :options="tokenOptions(i)"
      @update:amount="handleAmountChange($event, i)"
    />

    <InvestFormTotals
      :investMath="withdrawMath"
      @maximize="maximizeAmounts"
      @optimize="optimizeAmounts"
    />

    <div v-if="highPriceImpact" class="border rounded-lg p-4 pb-2 mt-4">
      <BalCheckbox
        v-model="state.highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        class="text-gray-500"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>

    <div class="mt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="toggleWalletSelectModal"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="!hasAmounts || !hasValidInputs || isMismatchedNetwork"
        block
        @click="showInvestPreview = true"
      />
    </div>

    <teleport to="#modal">
      <InvestPreviewModal
        v-if="showInvestPreview"
        :pool="pool"
        :investMath="withdrawMath"
        :tokenAddresses="state.tokenAddresses"
        @close="showInvestPreview = false"
      />
    </teleport>
  </div>
</template>
