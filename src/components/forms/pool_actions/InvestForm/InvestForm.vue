<script setup lang="ts">
import { computed, nextTick, onBeforeMount, ref, toRef, watch } from 'vue';
import { isRequired } from '@/lib/utils/validations';
import { bnum } from '@/lib/utils';
// Types
import { FullPool, PoolType } from '@/services/balancer/subgraph/types';
// Composables
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import useInvestState from './composables/useInvestState';
import useInvestMath from './composables/useInvestMath';
import { isStableLike, usePool } from '@/composables/usePool';
// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import { getAddress } from '@ethersproject/address';
import useConfig from '@/composables/useConfig';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';

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

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const showInvestPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { useNativeAsset, usdAsset } = usePoolTransfers();
const {
  tokenAddresses,
  amounts,
  validInputs,
  highPriceImpactAccepted,
  resetAmounts,
  sor
} = useInvestState();

const investMath = useInvestMath(
  toRef(props, 'pool'),
  tokenAddresses,
  amounts,
  useNativeAsset,
  sor
);

const { networkConfig } = useConfig();
const batchRelayerApprovalQuery = useRelayerApprovalQuery(
  ref(networkConfig.addresses.batchRelayer)
);

const isLoadingBatchRelayerApproval = computed(() => {
  return batchRelayerApprovalQuery.isLoading.value;
});

const {
  hasAmounts,
  highPriceImpact,
  maximizeAmounts,
  optimizeAmounts,
  proportionalAmounts,
  batchSwapLoading
} = investMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

const {
  managedPoolWithTradingHalted,
  isWethPool,
  isStableLikePool,
  isWeightedPoolWithNestedLinearPools,
  hasNestedUsdStablePhantomPool
} = usePool(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const hasValidInputs = computed(
  (): boolean =>
    validInputs.value.every(validInput => validInput === true) &&
    hasAcceptedHighPriceImpact.value
);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const forceProportionalInputs = computed(
  (): boolean => managedPoolWithTradingHalted.value
);

const investmentTokens = computed((): string[] => {
  if (props.pool.mainTokens) {
    if (
      hasNestedUsdStablePhantomPool.value &&
      isWeightedPoolWithNestedLinearPools.value
    ) {
      return props.pool.mainTokens.filter(
        mainToken =>
          !(
            networkConfig.usdTokens.includes(mainToken) &&
            mainToken.toLowerCase() !==
              networkConfig.addresses.usdc.toLowerCase()
          )
      );
    }

    return props.pool.mainTokens;
  }
  return props.pool.tokenAddresses.map(address => getAddress(address));
});

/**
 * METHODS
 */
function handleAmountChange(value: string, index: number): void {
  amounts.value[index] = value;

  nextTick(() => {
    if (forceProportionalInputs.value) {
      amounts.value = [...proportionalAmounts.value];
    }
  });
}

function handleAddressChange(newAddress: string): void {
  if (networkConfig.usdTokens.includes(newAddress)) {
    usdAsset.value = newAddress;
  } else {
    useNativeAsset.value = newAddress === nativeAsset.address;
  }
}

function tokenWeight(address: string): number {
  if (address === nativeAsset.address) {
    address = wrappedNativeAsset.value.address;
  }

  if (isStableLike(props.pool.poolType)) return 0;

  if (props.pool.linearPools) {
    const linearPool = props.pool.linearPools.find(linear => {
      return linear.mainToken.address.toLowerCase() === address.toLowerCase();
    });

    if (linearPool) {
      return parseFloat(
        props.pool.onchain.tokens[getAddress(linearPool.poolToken)].weight ||
          '0'
      );
    }
  }

  return props.pool.onchain.tokens[address].weight
    ? parseFloat(props.pool.onchain.tokens[address].weight)
    : 0;
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
  if (
    investmentTokens.value[index] === wrappedNativeAsset.value.address &&
    props.pool.poolType !== PoolType.StablePhantom
  ) {
    return [wrappedNativeAsset.value.address, nativeAsset.address];
  } else if (
    isWeightedPoolWithNestedLinearPools.value &&
    hasNestedUsdStablePhantomPool.value &&
    networkConfig.usdTokens.includes(getAddress(investmentTokens.value[index]))
  ) {
    return networkConfig.usdTokens;
  }

  return [];
}

// If ETH has a higher balance than WETH then use it for the input.
function setNativeAssetByBalance(): void {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  if (bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)) {
    setNativeAsset(NativeAsset.unwrapped);
    useNativeAsset.value = true;
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

  const indexOfAsset = tokenAddresses.value.indexOf(fromAddress);

  if (indexOfAsset >= 0) {
    tokenAddresses.value[indexOfAsset] = toAddress;
  }
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  resetAmounts();
  tokenAddresses.value = [...investmentTokens.value];
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

watch(usdAsset, selectedUsdAsset => {
  tokenAddresses.value = tokenAddresses.value.map(tokenAddress =>
    networkConfig.usdTokens.includes(tokenAddress)
      ? selectedUsdAsset
      : tokenAddress
  );
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
      v-for="(n, i) in tokenAddresses.length"
      :key="i"
      :name="tokenAddresses[i]"
      v-model:address="tokenAddresses[i]"
      v-model:amount="amounts[i]"
      v-model:isValid="validInputs[i]"
      :weight="tokenWeight(tokenAddresses[i])"
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

    <div
      v-if="highPriceImpact"
      class="border dark:border-gray-700 rounded-lg p-2 pb-2 mt-4"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>

    <WrapStEthLink :pool="pool" class="mt-4" />

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
        :disabled="
          !hasAmounts ||
            !hasValidInputs ||
            isMismatchedNetwork ||
            batchSwapLoading ||
            isLoadingBatchRelayerApproval
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <teleport to="#modal">
      <InvestPreviewModal
        v-if="showInvestPreview"
        :pool="pool"
        :math="investMath"
        :tokenAddresses="tokenAddresses"
        @close="showInvestPreview = false"
      />
    </teleport>
  </div>
</template>
