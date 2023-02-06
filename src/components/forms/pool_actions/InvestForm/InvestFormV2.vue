<script setup lang="ts">
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { usePool } from '@/composables/usePool';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import { bnum, forChange } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import useVeBal from '@/composables/useVeBAL';

import useJoinPool from '@/composables/pools/useJoinPool';
import InvestPreviewModalV2 from './components/InvestPreviewModal/InvestPreviewModalV2.vue';
import InvestFormTotalsV2 from './components/InvestFormTotalsV2.vue';

import useMyWalletTokens from '@/composables/useMyWalletTokens';
import MissingPoolTokensAlert from './components/MissingPoolTokensAlert.vue';
import { useTokens } from '@/providers/tokens.provider';
import { isEqual } from 'lodash';

/**
 * TYPES
 */
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
const { managedPoolWithSwappingHalted, isDeepPool, isPreMintedBptPool } =
  usePool(toRef(props, 'pool'));
const { veBalTokenInfo } = useVeBal();
const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();
const { wrappedNativeAsset } = useTokens();
const {
  isLoadingQuery,
  isSingleAssetJoin,
  amountsIn,
  highPriceImpact,
  highPriceImpactAccepted,
  hasValidInputs,
  hasAmountsIn,
  queryError,
  setAmountsIn,
  addTokensIn,
} = useJoinPool();

const { poolTokensWithBalance, isLoadingBalances, poolTokensWithoutBalance } =
  useMyWalletTokens({
    pool: props.pool,
    includeNativeAsset: true,
  });

/**
 * COMPUTED
 */
const forceProportionalInputs = computed(
  (): boolean => managedPoolWithSwappingHalted.value
);

const poolHasLowLiquidity = computed((): boolean =>
  bnum(props.pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
);

async function initializeTokensForm(isSingleAssetJoin: boolean) {
  setAmountsIn([]);
  if (isSingleAssetJoin) {
    addTokensIn([wrappedNativeAsset.value.address]);
  } else {
    await forChange(isLoadingBalances, false);
    addTokensIn(poolTokensWithBalance.value);
  }
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  initializeTokensForm(isSingleAssetJoin.value);
});

/**
 * WATCHERS
 */
watch(
  [isSingleAssetJoin, poolTokensWithBalance],
  (
    [isSingleAsset, newPoolTokensWithBalance],
    [prevIsSingleAsset, prevPoolTokensWithBalance]
  ) => {
    // Initialize token form if token balances change (ie. After investing, transaction confirmed or when account changes)
    // only if preview modal is not open
    if (!showInvestPreview.value) {
      const hasTabChanged = prevIsSingleAsset !== isSingleAsset;
      const hasUserTokensChanged = !isEqual(
        prevPoolTokensWithBalance,
        newPoolTokensWithBalance
      );
      if (hasUserTokensChanged || hasTabChanged) {
        initializeTokensForm(isSingleAsset);
      }
    }
  }
);
</script>

<template>
  <div>
    <BalAlert
      v-if="forceProportionalInputs"
      type="warning"
      :title="$t('investment.warning.managedPoolSwappingHalted.title')"
      :description="
        $t('investment.warning.managedPoolSwappingHalted.description')
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
    <TokenInput
      v-for="amountIn in amountsIn"
      :key="amountIn.address"
      v-model:isValid="amountIn.valid"
      v-model:address="amountIn.address"
      v-model:amount="amountIn.value"
      :name="amountIn.address"
      class="mb-4"
      :fixedToken="!isSingleAssetJoin"
      :excludedTokens="[veBalTokenInfo?.address, pool.address]"
    />

    <MissingPoolTokensAlert
      v-if="!isSingleAssetJoin"
      :showSingleTokenSuggestion="isDeepPool && isPreMintedBptPool"
      :poolTokensWithBalance="poolTokensWithBalance"
      :poolTokensWithoutBalance="poolTokensWithoutBalance"
    />

    <InvestFormTotalsV2 />

    <div
      v-if="highPriceImpact"
      class="p-2 pb-2 mt-5 rounded-lg border dark:border-gray-700 high-price-impact"
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

    <BalAlert
      v-if="queryError"
      type="error"
      :title="$t('thereWasAnError')"
      :description="queryError"
      class="mt-4"
      block
    />

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
          !hasAmountsIn ||
          !hasValidInputs ||
          isMismatchedNetwork ||
          isLoadingQuery ||
          !!queryError
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <teleport to="#modal">
      <InvestPreviewModalV2
        v-if="showInvestPreview"
        :pool="pool"
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
  </div>
</template>

<style scoped>
.high-price-impact:has(.bal-checkbox-error) {
  @apply border-red-500 bg-red-50 dark:bg-red-500 bg-opacity-50 dark:bg-opacity-5 transition-colors;
}
</style>
