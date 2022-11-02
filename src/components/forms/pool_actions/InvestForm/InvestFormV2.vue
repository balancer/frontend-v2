<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, toRef, watch } from 'vue';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/stake/StakePreviewModal.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import { bnum, forChange } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import useVeBal from '@/composables/useVeBAL';

import useJoinPool from '@/composables/pools/useJoinPool';
import InvestPreviewModalV2 from './components/InvestPreviewModal/InvestPreviewModalV2.vue';
import InvestFormTotalsV2 from './components/InvestFormTotalsV2.vue';

import useRelayerApproval, {
  Relayer,
} from '@/composables/trade/useRelayerApproval';

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
const { wrappedNativeAsset } = useTokens();
const { managedPoolWithTradingHalted } = usePool(toRef(props, 'pool'));
const { veBalTokenInfo } = useVeBal();
const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();
const {
  isLoadingQuery,
  isSingleAssetJoin,
  joinTokens,
  amountsIn,
  highPriceImpact,
  highPriceImpactAccepted,
  hasValidInputs,
  hasAmountsIn,
  queryError,
  setAmountsIn,
  addTokensIn,
} = useJoinPool();

const relayerApproval = useRelayerApproval(Relayer.BATCH_V4);

/**
 * COMPUTED
 */
const forceProportionalInputs = computed(
  (): boolean => managedPoolWithTradingHalted.value
);

const poolHasLowLiquidity = computed((): boolean =>
  bnum(props.pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  setAmountsIn([]);
  if (isSingleAssetJoin.value) {
    addTokensIn([joinTokens.value[0]]);
  } else {
    addTokensIn(joinTokens.value);
  }
});

onMounted(async () => {
  await forChange(relayerApproval.loading, false);
  console.log({ relayerApproval });
  if (!relayerApproval.isUnlocked.value) {
    const tx = await relayerApproval.approve();
    const res = await tx.wait();
    console.log({ res });
  }
});

/**
 * WATCHERS
 */
watch(isSingleAssetJoin, isSingleAsset => {
  setAmountsIn([]);
  if (isSingleAsset) {
    addTokensIn([wrappedNativeAsset.value.address]);
  } else {
    addTokensIn(joinTokens.value);
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

    <InvestFormTotalsV2 />

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

    <StakingProvider :poolAddress="pool.address">
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
    </StakingProvider>
  </div>
</template>

<style scoped>
/* This is needed because the trade settings popover overflows */
.label {
  @apply font-bold text-sm mb-2 inline-block;
}
</style>
