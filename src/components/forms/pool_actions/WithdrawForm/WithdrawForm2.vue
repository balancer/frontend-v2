<script setup lang="ts">
import { toRef, computed, ref, onBeforeMount } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
// Composables
import useWithdrawMath from './composables/useWithdrawMath';
import useWithdrawalState from './composables/useWithdrawalState';
import useWeb3 from '@/services/web3/useWeb3';
import { useI18n } from 'vue-i18n';
// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import WithdrawTotals from './components/WithdrawTotals.vue';
import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal.vue';
import ProportionalWithdrawalInput from './components/ProportionalWithdrawalInput.vue';
import WithdrawalTokenSelect from './components/WithdrawalTokenSelect.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
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
  validInput
} = useWithdrawalState(toRef(props, 'pool'));

const withdrawMath = useWithdrawMath(
  toRef(props, 'pool'),
  isProportional,
  tokenOut,
  tokenOutIndex
);

const {
  hasAmounts,
  highPriceImpact,
  singleAssetMaxes,
  tokenOutAmount,
  tokenOutPoolBalance
} = withdrawMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

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
  isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance'))
]);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  isProportional.value = true;
});
</script>

<template>
  <div>
    <ProportionalWithdrawalInput
      v-if="isProportional"
      :pool="pool"
      :tokenAddresses="pool.tokenAddresses"
      :math="withdrawMath"
    />
    <TokenInput
      v-else
      :name="tokenOut"
      :address="tokenOut"
      v-model:amount="tokenOutAmount"
      v-model:isValid="validInput"
      :customBalance="singleAssetMaxes[tokenOutIndex]"
      :rules="singleAssetRules"
      :balanceLabel="$t('singleTokenMax')"
      fixedToken
      disableEthBuffer
    >
      <template #tokenSelect>
        <WithdrawalTokenSelect :pool="pool" :initToken="tokenOut" />
      </template>
    </TokenInput>

    <WithdrawTotals :math="withdrawMath" class="mt-4" />

    <div v-if="highPriceImpact" class="border rounded-lg p-4 pb-2 mt-4">
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        class="text-gray-500"
        size="sm"
        :label="$t('priceImpactAccept', [$t('withdrawing')])"
      />
    </div>

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
        :disabled="!hasAmounts || !hasValidInputs || isMismatchedNetwork"
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
