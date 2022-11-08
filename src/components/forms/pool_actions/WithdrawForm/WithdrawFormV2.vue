<script setup lang="ts">
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import ProportionalWithdrawalInputV2 from './components/ProportionalWithdrawalInputV2.vue';
import WithdrawalTokenSelect from './components/WithdrawalTokenSelect.vue';
import WithdrawTotalsV2 from './components/WithdrawTotalsV2.vue';

import useWithdrawalState from './composables/useWithdrawalState';
// Composables
import useExitPool from '@/composables/pools/useExitPool';
import WithdrawPreviewModalV2 from './components/WithdrawPreviewModal/WithdrawPreviewModalV2.vue';

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

const showPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const {
  // isProportional,
  tokenOut,
  // highPriceImpactAccepted,
  validInput,
  maxSlider,
  tokensOut,
  error,
  parseError,
  setError,
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

const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

const {
  pool,
  isSingleAssetExit,
  exitTokens,
  isLoadingQuery,
  highPriceImpact,
  hasAcceptedHighPriceImpact,
  highPriceImpactAccepted,
  txInProgress,
  hasAmountsOut,
  bptBalance,
  tokenOutPoolBalance,
} = useExitPool();

/**
 * COMPUTED
 */

const hasValidInputs = computed(
  (): boolean => validInput.value && hasAcceptedHighPriceImpact.value
);

const singleAssetRules = computed(() => [
  isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance')),
]);

/**
 * WATCHERS
 */
watch(isSingleAssetExit, newVal => {
  // If user selects to withdraw all tokens proportionally
  // reset the slider to max.
  if (!newVal) {
    // initMath();
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
  // isProportional.value = true;
  // initMath();
  maxSlider();
});
</script>

<template>
  <div>
    isSingleAssetExit: {{ isSingleAssetExit }}
    <ProportionalWithdrawalInputV2
      v-if="!isSingleAssetExit"
      :pool="pool"
      :tokenAddresses="tokensOut"
    />
    <TokenInput
      v-else
      v-model:amount="exitTokens[0]"
      v-model:isValid="validInput"
      :name="tokenOut"
      :address="tokenOut"
      :disableBalance="exitTokens[0] === '-'"
      :customBalance="exitTokens[0] || '0'"
      :rules="singleAssetRules"
      :balanceLabel="$t('singleTokenMax')"
      :balanceLoading="isLoadingQuery"
      fixedToken
      disableNativeAssetBuffer
    >
      <template #tokenSelect>
        <WithdrawalTokenSelect :pool="pool" :initToken="tokenOut" />
      </template>
    </TokenInput>

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
    </teleport>
  </div>
</template>
