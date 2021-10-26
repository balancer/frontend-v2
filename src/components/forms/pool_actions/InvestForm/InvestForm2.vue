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
import useInvestMath from './composables/useInvestMath';
import { isRequired } from '@/lib/utils/validations';
import { bnum } from '@/lib/utils';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped'
}

type Props = {
  pool: FullPool;
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

/**
 * STATE
 */
const state = reactive<FormState>({
  amounts: [],
  tokenAddresses: [],
  propAmounts: [],
  validInputs: [],
  highPriceImpactAccepted: false,
  submitting: false
});

const showInvestPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { useNativeAsset } = usePoolTransfers();

const investMath = useInvestMath(
  toRef(props, 'pool'),
  toRef(state, 'tokenAddresses'),
  toRef(state, 'amounts'),
  useNativeAsset
);

const {
  hasAmounts,
  highPriceImpact,
  maximizeAmounts,
  optimizeAmounts,
  proportionalAmounts
} = investMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

const { managedPoolWithTradingHalted, isWethPool, isStableLikePool } = usePool(
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
  (): boolean => managedPoolWithTradingHalted.value
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

function handleAddressChange(newAddress: string): void {
  useNativeAsset.value = newAddress === nativeAsset.address;
}

function tokenWeight(address: string): number {
  if (isStableLike(props.pool.poolType)) return 0;
  if (address === nativeAsset.address) {
    return props.pool.onchain.tokens[wrappedNativeAsset.value.address].weight;
  }

  return props.pool.onchain.tokens[address].weight;
}

function propAmountFor(index: number): string {
  if (isStableLikePool.value) return '0.0';

  return bnum(proportionalAmounts.value[index]).gt(0)
    ? proportionalAmounts.value[index]
    : '0.0';
}

function hint(index: number): string {
  return bnum(propAmountFor(index)).gt(0) ? t('proportionalSuggestion') : '';
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

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  state.tokenAddresses = [...props.pool.tokenAddresses];
  if (isWethPool.value) setNativeAssetByBalance();
});

/**
 * WATCHERS
 */
watch(useNativeAsset, shouldUseNativeAsset => {
  if (shouldUseNativeAsset) {
    setNativeAsset(NativeAsset.unwrapped);
  } else {
    setNativeAsset(NativeAsset.wrapped);
  }
});
</script>

<template>
  <div>
    <BalAlert
      v-if="forceProportionalInputs"
      type="warning"
      :title="$t('investment.warning.managedPoolTradingHaulted.title')"
      :description="
        $t('investment.warning.managedPoolTradingHaulted.description')
      "
      class="mb-4"
    />

    <TokenInput
      v-for="(n, i) in state.tokenAddresses.length"
      :key="i"
      :name="state.tokenAddresses[i]"
      v-model:address="state.tokenAddresses[i]"
      v-model:amount="state.amounts[i]"
      v-model:isValid="state.validInputs[i]"
      :weight="tokenWeight(state.tokenAddresses[i])"
      :hintAmount="propAmountFor(i)"
      :hint="hint(i)"
      class="mb-4"
      fixedToken
      :options="tokenOptions(i)"
      @update:amount="handleAmountChange($event, i)"
      @update:address="handleAddressChange($event)"
    />

    <InvestFormTotals
      :math="investMath"
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
        :math="investMath"
        :tokenAddresses="state.tokenAddresses"
        @close="showInvestPreview = false"
      />
    </teleport>
  </div>
</template>
