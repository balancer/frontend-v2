<script setup lang="ts">
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';
// Composables
import { useI18n } from 'vue-i18n';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/stake/StakePreviewModal.vue';
// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { isStableLike, isStablePhantom, usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import { bnum } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import StakingProvider from '@/providers/local/staking/staking.provider';
// Types
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import useInvestMath from './composables/useInvestMath';
import useInvestState from './composables/useInvestState';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped'
}

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const showInvestPreview = ref(false);
const showStakeModal = ref(false);
const pool = toRef(props, 'pool');

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { useNativeAsset } = usePoolTransfers();
const {
  tokenAddresses,
  amounts,
  validInputs,
  highPriceImpactAccepted,
  resetAmounts,
  singleAssetInAmount,
  singleAssetInAddress
} = useInvestState();

const singleAssetTokenAddresses = computed(() => [singleAssetInAddress.value]);
const singleAssetAmounts = computed(() => [singleAssetInAmount.value]);

const investMath = useInvestMath(
  pool,
  singleAssetTokenAddresses,
  singleAssetAmounts,
  useNativeAsset
);

const { hasAmounts, highPriceImpact, swapRouteLoading, swapRoute } = investMath;

const {
  isWalletReady,
  startConnectWithInjectedProvider,
  isMismatchedNetwork
} = useWeb3();

const { managedPoolWithTradingHalted, isWethPool } = usePool(pool);
const { veBalTokenInfo } = useVeBal();

// console.log({
//   isWethPool: isWethPool.value,
//   isStableLikePool: isStableLikePool.value,
//   isStablePhantomPool: isStablePhantomPool.value,
//   isStablePhantom: isStablePhantom(props.pool.poolType)
// });

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

const poolHasLowLiquidity = computed((): boolean =>
  bnum(props.pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
);

const investmentTokens = computed((): string[] => {
  if (isStablePhantom(props.pool.poolType)) {
    return props.pool.mainTokens || [];
  }
  return props.pool.tokensList;
});

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
</script>

<template>
  <div>
    <BalAlert
      v-if="forceProportionalInputs"
      type="warning"
      :title="$t('investment.warning.managedPoolTradingHalted.title')"
      :description="
        $t('investment.warning.managedPoolTradingHalted.description')
      "
      class="mb-4"
    />

    <BalAlert
      v-if="poolHasLowLiquidity"
      type="warning"
      :title="$t('investment.warning.lowLiquidity.title')"
      :description="$t('investment.warning.lowLiquidity.description')"
      class="mb-4"
    />

    <TokenInput
      :amount="singleAssetInAmount"
      :address="singleAssetInAddress"
      name="tokenIn"
      class="mb-4"
      @update:amount="amount => (singleAssetInAmount = amount)"
      @update:address="address => (singleAssetInAddress = address)"
      :excludedTokens="[veBalTokenInfo?.address]"
    />

    <InvestFormTotals
      :math="investMath"
      @maximize="() => {}"
      @optimize="() => {}"
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
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="
          !hasAmounts ||
            !hasValidInputs ||
            isMismatchedNetwork ||
            swapRouteLoading
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <StakingProvider :poolAddress="pool.address">
      <teleport to="#modal">
        <InvestPreviewModal
          v-if="showInvestPreview"
          :pool="pool"
          :math="investMath"
          :tokenAddresses="singleAssetTokenAddresses"
          @close="showInvestPreview = false"
          @showStakeModal="showStakeModal = true"
        />
        <StakePreviewModal
          :pool="pool"
          :isVisible="showStakeModal"
          @close="showStakeModal = false"
          action="stake"
        />
      </teleport>
    </StakingProvider>
  </div>
</template>
