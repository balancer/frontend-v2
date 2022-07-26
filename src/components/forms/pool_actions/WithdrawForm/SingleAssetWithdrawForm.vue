<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal.vue';
import WithdrawTotals from './components/WithdrawTotals.vue';
import useSingleAssetWithdrawalState from './composables/useSingleAssetWithdrawalState';
import useSingleAssetWithdrawMath from './composables/useSingleAssetWithdrawMath';

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

const pool = computed(() => props.pool);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const withdrawState = useSingleAssetWithdrawalState(pool);

const {
  tokenOut,
  tokenOutIndex,
  highPriceImpactAccepted,
  validInput,
  tokensOut,
  error,
  parseError,
  setError
} = withdrawState;

const tokenOutAmount = ref<string>('');

const withdrawMath = useSingleAssetWithdrawMath(pool, tokenOut, tokenOutAmount);

const { swapRoute, singleAssetMax, swapRouteLoading } = withdrawMath;

const {
  isWalletReady,
  startConnectWithInjectedProvider,
  isMismatchedNetwork
} = useWeb3();

/**
 * COMPUTED
 */
// const hasAcceptedHighPriceImpact = computed((): boolean =>
//   highPriceImpact.value ? highPriceImpactAccepted.value : true
// );

const hasValidInputs = computed(
  (): boolean => true
  // (): boolean => validInput.value && hasAcceptedHighPriceImpact.value
);

const singleAssetRules = computed(() => [
  // isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance'))
]);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  // initMath();
});
</script>

<template>
  <div>
    <TokenInput
      :name="tokenOut"
      v-model:address="tokenOut"
      v-model:amount="tokenOutAmount"
      v-model:isValid="validInput"
      :rules="singleAssetRules"
      :balanceLabel="$t('singleTokenMax')"
      :balanceLoading="swapRouteLoading"
      :customBalance="singleAssetMax || '0'"
    />

    <!-- <WithdrawTotals :math="withdrawMath" class="mt-4" /> -->

    <!-- <div
      v-if="highPriceImpact"
      class="border dark:border-gray-700 rounded-lg p-2 pb-2 mt-4"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('withdrawing')])"
      />
    </div> -->

    <BalAlert
      v-if="error !== null"
      type="error"
      :title="parseError(error).title"
      :description="parseError(error).description"
      class="mt-4"
      block
      actionLabel="Dismiss"
      @actionClick="setError(null)"
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
          !tokenOutAmount ||
            !hasValidInputs ||
            isMismatchedNetwork ||
            swapRouteLoading
        "
        block
        @click="showPreview = true"
      />
    </div>

    <teleport to="#modal">
      <!-- <WithdrawPreviewModal
        v-if="showPreview"
        :pool="pool"
        :math="withdrawMath"
        @close="showPreview = false"
      /> -->
    </teleport>
  </div>
</template>
