<script setup lang="ts">
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
import useWeb3 from '@/services/web3/useWeb3';
import ProportionalWithdrawalInput from './components/ProportionalWithdrawalInput.vue';
import WithdrawTotals from './components/WithdrawTotals.vue';
import { useExitPool } from '@/providers/local/exit-pool.provider';
import useVeBal from '@/composables/useVeBAL';
import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal.vue';
import { useTokens } from '@/providers/tokens.provider';
import {
  tokensListExclBpt,
  usePoolHelpers,
} from '@/composables/usePoolHelpers';
import { useI18n } from 'vue-i18n';
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const pool = toRef(props, 'pool');

/**
 * STATE
 */
const showPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { veBalTokenInfo } = useVeBal();
const { wrappedNativeAsset, nativeAsset } = useTokens();
const router = useRouter();
const { networkSlug } = useNetwork();
const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();
const {
  isSingleAssetExit,
  singleAmountOut,
  isLoadingMax,
  queryError,
  maxError,
  isLoadingQuery,
  highPriceImpact,
  highPriceImpactAccepted,
  hasAcceptedHighPriceImpact,
  hasAmountsOut,
  validAmounts,
  hasBpt,
  shouldUseRecoveryExit,
  canSwapExit,
} = useExitPool();

const { isWrappedNativeAssetPool } = usePoolHelpers(pool);

/**
 * COMPUTED
 */
const singleAssetRules = computed(() => [
  isLessThanOrEqualTo(singleAmountOut.max, t('exceedsPoolBalance')),
]);

const hasValidInputs = computed(
  (): boolean => validAmounts.value && hasAcceptedHighPriceImpact.value
);

const tokensList = computed(() => tokensListExclBpt(pool.value));

// Limit token select modal to a subset.
const subsetTokens = computed((): string[] => {
  // Returning an empty array means all tokens are presented in the modal.
  if (!shouldUseRecoveryExit.value && canSwapExit.value) return [];

  if (isWrappedNativeAssetPool.value)
    return [nativeAsset.address, ...tokensList.value];

  return tokensList.value;
});

const excludedTokens = computed((): string[] => {
  const tokens = [pool.value.address];
  if (veBalTokenInfo.value) {
    tokens.unshift(veBalTokenInfo.value.address);
  }
  return tokens;
});

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  // If user has no BPT when mounting this component, redirect back to pool page
  if (!hasBpt.value)
    router.push({ name: 'pool', params: { networkSlug, id: props.pool.id } });

  singleAmountOut.address =
    subsetTokens.value.length === 0
      ? wrappedNativeAsset.value.address
      : tokensList.value[0];
});
</script>

<template>
  <div data-testid="withdraw-form">
    <ProportionalWithdrawalInput v-if="!isSingleAssetExit" :pool="pool" />
    <template v-else>
      <!-- Single asset exit input -->
      <TokenInput
        v-model:isValid="singleAmountOut.valid"
        v-model:address="singleAmountOut.address"
        v-model:amount="singleAmountOut.value"
        :name="singleAmountOut.address"
        :rules="singleAssetRules"
        :customBalance="singleAmountOut.max || '0'"
        :balanceLabel="$t('max')"
        :balanceLoading="isLoadingMax"
        disableNativeAssetBuffer
        :excludedTokens="excludedTokens"
        :tokenSelectProps="{ ignoreBalances: true, subsetTokens }"
        ignoreWalletBalance
      />
    </template>

    <WithdrawTotals class="mt-4" />

    <div
      v-if="highPriceImpact"
      class="p-2 pb-2 mt-4 rounded-lg border dark:border-gray-700"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('withdrawing')])"
      />
    </div>

    <BalAlert
      v-if="queryError || maxError"
      type="error"
      :title="$t('thereWasAnError')"
      :description="queryError || maxError"
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
          !hasAmountsOut ||
          !hasValidInputs ||
          isMismatchedNetwork ||
          isLoadingQuery ||
          isLoadingMax
        "
        block
        @click="showPreview = true"
      />
    </div>

    <teleport to="#modal">
      <WithdrawPreviewModal
        v-if="showPreview"
        :pool="pool"
        @close="showPreview = false"
      />
    </teleport>
  </div>
</template>
