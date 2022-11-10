<script setup lang="ts">
import { onBeforeMount, toRef, watch } from 'vue';
// import { useI18n } from 'vue-i18n';

// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
// import { isLessThanOrEqualTo } from '@/lib/utils/validations';
import { Pool } from '@/services/pool/types';
// import useWeb3 from '@/services/web3/useWeb3';

import ProportionalWithdrawalInputV2 from './components/ProportionalWithdrawalInputV2.vue';
// import WithdrawalTokenSelect from './components/WithdrawalTokenSelect.vue';
// import WithdrawTotalsV2 from './components/WithdrawTotalsV2.vue';

import useWithdrawalState from './composables/useWithdrawalState';
// Composables
import useExitPool from '@/composables/pools/useExitPool';
// import useVeBal from '@/composables/useVeBAL';
// import WithdrawPreviewModalV2 from './components/WithdrawPreviewModal/WithdrawPreviewModalV2.vue';
import { isDeep } from '@/composables/usePool';
// import useTokens from '@/composables/useTokens';

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

// const showPreview = ref(false);

/**
 * COMPOSABLES
 */
// const { t } = useI18n();
// const { veBalTokenInfo } = useVeBal();
// const { wrappedNativeAsset } = useTokens();

const {
  // isProportional,
  // tokenOut,
  // highPriceImpactAccepted,
  // validInput,
  maxSlider,
  // error,
  // parseError,
  // setError,
  // txInProgress,
} = useWithdrawalState(toRef(props, 'pool'));

// const withdrawMath = useWithdrawMath(
//   toRef(props, 'pool'),
//   isProportional,
//   tokensOut,
//   tokenOut,
//   tokenOutIndex
// );

// const {
//   hasAmounts,
//   highPriceImpact,
//   singleAssetMaxes,
//   tokenOutAmount,
//   tokenOutPoolBalance,
//   loadingData,
//   bptBalance,
//   initMath,
//   resetMath,
// } = withdrawMath;

// const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
//   useWeb3();

const {
  pool,
  isSingleAssetExit,
  // exitTokenAddresses,
  // isLoadingQuery,
  // isLoadingSingleAssetMax,
  bptIn,
  bptValid,
  // highPriceImpact,
  // hasAcceptedHighPriceImpact,
  // highPriceImpactAccepted,
  txInProgress,
  // hasAmountsOut,
  bptBalance,
  // tokenOutPoolBalance,
} = useExitPool();

/**
 * COMPUTED
 */

// const hasValidInputs = computed(
//   (): boolean => validInput.value && hasAcceptedHighPriceImpact.value
// );

// const singleAssetRules = computed(() => [
//   isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance')),
// ]);

/**
 * WATCHERS
 */
watch(isSingleAssetExit, _isSingleAssetExit => {
  // If user selects to withdraw all tokens proportionally
  // reset the slider to max.
  if (!_isSingleAssetExit) {
    maxSlider();
  }
});

watch(bptBalance, () => {
  if (!txInProgress.value) {
    // The user's BPT balance has changed in the background. Reset maths so
    // they're working with up to date values.
    // resetMath();
  }
});

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (!isSingleAssetExit.value) {
    maxSlider();
  }
});
</script>

<template>
  <div>
    <ProportionalWithdrawalInputV2 v-if="!isSingleAssetExit" :pool="pool" />
    <template v-else>
      <template v-if="isDeep(pool)">
        <!-- Render swap exit UI -->
        <div class="mb-1 font-medium">{{ $t('youWithdraw') }}</div>
        <TokenInput
          v-model:isValid="bptValid"
          v-model:amount="bptIn"
          :address="pool.address"
          fixedToken
          :name="pool.address"
          class="mb-4"
        />

        <div class="mb-1 font-medium">{{ $t('youRecieve') }}</div>
        <!-- <TokenInput
          v-model:isValid="singleTokenOut.valid"
          v-model:address="singleTokenOut.address"
          v-model:amount="singleTokenOut.value"
          :name="singleTokenOut.address"
          disableNativeAssetBuffer
          disableBalance
          ignoreWalletBalance
          disabled
          noMax
          :excludedTokens="[veBalTokenInfo?.address, pool.address]"
        /> -->
      </template>
      <template v-else>
        <!-- Render single asset exit UI -->
      </template>
    </template>

    <!-- <WithdrawTotalsV2 class="mt-4" />

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
      v-if="error !== null"
      type="error"
      :title="parseError(error).title"
      :description="parseError(error).description"
      class="mt-4"
      block
      actionLabel="Dismiss"
      @action-click="setError(null)"
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
          isLoadingQuery
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
    </teleport> -->
  </div>
</template>
