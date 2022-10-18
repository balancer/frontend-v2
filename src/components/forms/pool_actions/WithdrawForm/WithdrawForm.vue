<script setup lang="ts">
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import ProportionalWithdrawalInput from './components/ProportionalWithdrawalInput.vue';
import WithdrawalTokenSelect from './components/WithdrawalTokenSelect.vue';
import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal.vue';
import WithdrawTotals from './components/WithdrawTotals.vue';
import useWithdrawalState from './composables/useWithdrawalState';
// Composables
import useWithdrawMath from './composables/useWithdrawMath';

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
  isProportional,
  tokenOut,
  tokenOutIndex,
  highPriceImpactAccepted,
  validInput,
  maxSlider,
  tokensOut,
  error,
  parseError,
  setError,
  txInProgress,
} = useWithdrawalState(toRef(props, 'pool'));

const withdrawMath = useWithdrawMath(
  toRef(props, 'pool'),
  isProportional,
  tokensOut,
  tokenOut,
  tokenOutIndex
);

const {
  hasAmounts,
  highPriceImpact,
  singleAssetMaxes,
  tokenOutAmount,
  tokenOutPoolBalance,
  loadingData,
  bptBalance,
  initMath,
  resetMath,
} = withdrawMath;

const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

/**
 * COMPUTED
 */
const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const hasValidInputs = computed(
  (): boolean => validInput.value && hasAcceptedHighPriceImpact.value
);

const singleAssetRules = computed(() => [
  isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance')),
]);

/**
 * WATCHERS
 */
watch(isProportional, newVal => {
  // If user selects to withdraw all tokens proportionally
  // reset the slider to max.
  if (newVal) {
    initMath();
    maxSlider();
  }
});

watch(bptBalance, () => {
  if (!txInProgress.value) {
    // The user's BPT balance has changed in the background. Reset maths so
    // they're working with up to date values.
    resetMath();
  }
});

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  isProportional.value = true;
  initMath();
  maxSlider();
});
</script>

<template>
  <div>
    <ProportionalWithdrawalInput
      v-if="isProportional"
      :pool="pool"
      :tokenAddresses="tokensOut"
      :math="withdrawMath"
    />
    <TokenInput
      v-else
      v-model:amount="tokenOutAmount"
      v-model:isValid="validInput"
      :name="tokenOut"
      :address="tokenOut"
      :disableBalance="singleAssetMaxes[tokenOutIndex] === '-'"
      :customBalance="singleAssetMaxes[tokenOutIndex] || '0'"
      :rules="singleAssetRules"
      :balanceLabel="$t('singleTokenMax')"
      :balanceLoading="loadingData"
      fixedToken
      disableNativeAssetBuffer
    >
      <template #tokenSelect>
        <WithdrawalTokenSelect :pool="pool" :initToken="tokenOut" />
      </template>
    </TokenInput>

    <WithdrawTotals :math="withdrawMath" class="mt-4" />

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
          !hasAmounts || !hasValidInputs || isMismatchedNetwork || loadingData
        "
        block
        @click="showPreview = true"
      />
    </div>

    <teleport to="#modal">
      <WithdrawPreviewModal
        v-if="showPreview"
        :pool="pool"
        :math="withdrawMath"
        @close="showPreview = false"
      />
    </teleport>
  </div>
</template>
