<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/stake/StakePreviewModal.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool, isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import { bnum, indexOfAddress } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

// import useInvestMath from './composables/useInvestMath';
import useInvestState from './composables/useInvestState';
import useVeBal from '@/composables/useVeBAL';

import useJoinPool from '../useJoinPool';
import { default as useJoinPoolv2 } from '@/composables/pools/useJoinPool';
import InvestPreviewModalV2 from './components/InvestPreviewModal/InvestPreviewModalV2.vue';
import InvestFormTotalsV2 from './components/InvestFormTotalsV2.vue';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped',
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

/**
 * COMPOSABLES
 */

const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { useNativeAsset } = usePoolTransfers();
const { bptOut: bptOutTest } = useJoinPoolv2();

console.log('bptOutTest', bptOutTest.value);

const {
  tokenAddresses,
  amounts,
  validInputs,
  highPriceImpactAccepted,
  resetAmounts,
  // sor,
} = useInvestState();

const {
  // swapRoute,
  bptOut,
  fiatValueOut,
  fiatValueIn,
  priceImpact,
  highPriceImpact,
  loadingData,
  fullAmounts,
  rektPriceImpact,
  hasAmounts,
  join,
} = useJoinPool(
  props.pool.id,
  props.pool.address,
  props.pool.onchain?.decimals,
  tokenAddresses,
  amounts
);

const pool = computed(() => props.pool);

// const investMath = useInvestMath(
//   pool,
//   tokenAddresses,
//   amounts,
//   useNativeAsset,
//   sor
// );

// const { hasAmounts } = investMath;

const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

const { managedPoolWithTradingHalted, isWethPool, isDeepPool } = usePool(pool);
const { veBalTokenInfo } = useVeBal();

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
  if (isDeep(props.pool)) {
    return props.pool.mainTokens || [];
  }
  return props.pool.tokensList;
});

/**
 * METHODS
 */

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

  const indexOfAsset = indexOfAddress(tokenAddresses.value, fromAddress);

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
      class="mb-5"
    />

    <BalAlert
      v-if="poolHasLowLiquidity"
      type="warning"
      :title="$t('investment.warning.lowLiquidity.title')"
      :description="$t('investment.warning.lowLiquidity.description')"
      class="mb-5"
    />
    <label class="label" for="tokenIn">You provide</label>
    <TokenInput
      id="tokenIn"
      v-model:address="tokenAddresses[0]"
      v-model:amount="amounts[0]"
      v-model:isValid="validInputs[0]"
      :name="tokenAddresses[0]"
      class="mb-5"
      :excludedTokens="[veBalTokenInfo?.address, pool.address]"
      @update:amount="amount => (amounts[0] = amount)"
      @update:address="address => (tokenAddresses[0] = address)"
    />

    <label class="label" for="tokenOut">You receive</label>
    <TokenInput
      id="tokenOut"
      v-model:address="pool.address"
      v-model:amount="bptOut"
      :name="pool.address"
      fixedToken
      disableMax
      noRules
      noMax
      class="mb-4"
      :excludedTokens="[veBalTokenInfo?.address, pool.address]"
      @update:amount="amount => (amounts[0] = amount)"
    />
    <InvestFormTotalsV2
      :loadingData="loadingData"
      :priceImpact="priceImpact"
      :highPriceImpact="highPriceImpact"
      :showTotalRow="!isDeepPool"
    />

    <div
      v-if="highPriceImpact"
      class="p-2 pb-2 mt-5 rounded-lg border dark:border-gray-700"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>

    <WrapStEthLink :pool="pool" class="mt-5" />

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
          !hasAmounts || !hasValidInputs || isMismatchedNetwork || loadingData
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <StakingProvider :poolAddress="pool.address">
      <teleport to="#modal">
        <InvestPreviewModalV2
          v-if="showInvestPreview"
          :pool="pool"
          :join="join"
          :tokenAddresses="tokenAddresses"
          :fullAmounts="fullAmounts"
          :highPriceImpact="highPriceImpact"
          :rektPriceImpact="rektPriceImpact"
          :priceImpact="priceImpact"
          :bptOut="bptOut"
          :fiatValueOut="fiatValueOut"
          :fiatValueIn="fiatValueIn"
          @close="showInvestPreview = false"
          @show-stake-modal="showStakeModal = true"
        />
        <StakePreviewModal
          :pool="pool"
          :isVisible="showStakeModal"
          action="stake"
          @close="showStakeModal = false"
        />
      </teleport>
    </StakingProvider>
  </div>
</template>

<style scoped>
/* This is needed because the trade settings popover overflows */
.label {
  @apply font-bold text-sm mb-2 inline-block;
}
</style>
