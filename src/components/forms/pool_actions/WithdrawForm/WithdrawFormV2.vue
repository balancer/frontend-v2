<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue';
// import { useI18n } from 'vue-i18n';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
import useWeb3 from '@/services/web3/useWeb3';
import ProportionalWithdrawalInputV2 from './components/ProportionalWithdrawalInputV2.vue';
import WithdrawTotalsV2 from './components/WithdrawTotalsV2.vue';
import useExitPool from '@/composables/pools/useExitPool';
import useVeBal from '@/composables/useVeBAL';
import WithdrawPreviewModalV2 from './components/WithdrawPreviewModal/WithdrawPreviewModalV2.vue';
import { isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { useI18n } from 'vue-i18n';

/**
 * STATE
 */
const showPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { veBalTokenInfo } = useVeBal();
const { wrappedNativeAsset } = useTokens();

const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

const {
  pool,
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
} = useExitPool();

/**
 * COMPUTED
 */
const singleAssetRules = computed(() => [
  isLessThanOrEqualTo(singleAmountOut.max, t('exceedsPoolBalance')),
]);

const hasValidInputs = computed(
  (): boolean => validAmounts.value && hasAcceptedHighPriceImpact.value
);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  singleAmountOut.address = wrappedNativeAsset.value.address;
});
</script>

<template>
  <div>
    <ProportionalWithdrawalInputV2 v-if="!isSingleAssetExit" :pool="pool" />
    <template v-else>
      <template v-if="isDeep(pool)">
        <!-- Render swap exit UI -->
        <TokenInput
          v-model:isValid="singleAmountOut.valid"
          v-model:address="singleAmountOut.address"
          v-model:amount="singleAmountOut.value"
          :name="singleAmountOut.address"
          :rules="singleAssetRules"
          :customBalance="singleAmountOut.max || '0'"
          :balanceLabel="$t('max')"
          :balanceLoading="isLoadingMax"
          :excludedTokens="[veBalTokenInfo?.address, pool.address]"
          :tokenSelectProps="{ ignoreBalances: true }"
          ignoreWalletBalance
        />
      </template>
      <template v-else>
        <!-- Render single asset exit UI -->
      </template>
    </template>

    <WithdrawTotalsV2 class="mt-4" />

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
      <WithdrawPreviewModalV2
        v-if="showPreview"
        :pool="pool"
        @close="showPreview = false"
      />
    </teleport>
  </div>
</template>
