<template>
  <BalCard class="relative">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">{{ $t(title) }}</h4>
        <TradeSettingsPopover :context="TradeSettingsContext.trade" />
      </div>
    </template>
    <div>
      <TradePair
        :token-in-amount-input="tokenInAmount"
        :token-in-address-input="tokenInAddress"
        :token-out-amount-input="tokenOutAmount"
        :token-out-address-input="tokenOutAddress"
        :exact-in="exactIn"
        :price-impact="priceImpact"
        @token-in-amount-change="value => (tokenInAmount = value)"
        @token-in-address-change="value => (tokenInAddress = value)"
        @token-out-amount-change="value => (tokenOutAmount = value)"
        @token-out-address-change="value => (tokenOutAddress = value)"
        @exact-in-change="value => (exactIn = value)"
        @change="handleAmountChange"
      />
      <GasReimbursement
        class="mb-5"
        :address-in="tokenInAddress"
        :address-out="tokenOutAddress"
        :sorReturn="sorReturn"
      />
      <BalCheckbox
        v-if="priceImpact >= 0.05"
        v-model="highPiAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPiAccepted"
        class="text-gray-500 mb-8"
        size="sm"
        :label="$t('priceImpactAccept')"
      />
      <BalBtn
        v-if="poolsLoading"
        :loading="true"
        :loading-label="$t('loading')"
        block
      />
      <BalBtn
        v-else-if="!isAuthenticated"
        :label="$t('connectWallet')"
        block
        @click.prevent="connectWallet"
      />
      <BalBtn v-else-if="errorMessage" :label="errorMessage" block disabled />
      <BalBtn
        v-else-if="requireApproval"
        :label="`${$t('approve')} ${tokens[tokenInAddress].symbol}`"
        :loading="approving"
        :loading-label="
          `${$t('approving')} ${tokens[tokenInAddress].symbol}...`
        "
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        type="submit"
        :label="`${$t(submitLabel)}`"
        :loading="trading"
        :disabled="tradeDisabled"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="trade"
      />
      <TradeRoute
        class="mt-5"
        :address-in="tokenInAddress"
        :amount-in="tokenInAmount"
        :address-out="tokenOutAddress"
        :amount-out="tokenOutAmount"
        :pools="pools"
        :sor-return="sorReturn"
      />
    </div>
    <SuccessOverlay
      v-if="tradeSuccess"
      :title="$t('tradeSettled')"
      :description="$t('tradeSuccess')"
      :closeLabel="$t('close')"
      :txHash="txHash"
      @close="tradeSuccess = false"
    />
  </BalCard>
</template>

<script lang="ts">
import { isRequired } from '@/lib/utils/validations';
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { isAddress, getAddress } from '@ethersproject/address';

import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation from '@/composables/trade/useValidation';
import useSor from '@/composables/trade/useSor';
import { ETHER } from '@/constants/tokenlists';

import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import TradePair from '@/components/cards/TradeCard/TradePair.vue';
import TradeRoute from '@/components/cards/TradeCard/TradeRoute.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import GasReimbursement from './GasReimbursement.vue';

export default defineComponent({
  components: {
    SuccessOverlay,
    TradePair,
    TradeRoute,
    TradeSettingsPopover,
    GasReimbursement
  },

  setup() {
    const highPiAccepted = ref(false);
    const store = useStore();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { fNum, toFiat } = useNumbers();

    const getTokens = (params = {}) =>
      store.getters['registry/getTokens'](params);
    const getConfig = () => store.getters['web3/getConfig']();
    const tokens = computed(() => getTokens({ includeEther: true }));

    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const tradeSuccess = ref(false);
    const txHash = ref('');

    const isWrap = computed(() => {
      const config = getConfig();
      return (
        tokenInAddress.value === ETHER.address &&
        tokenOutAddress.value === config.addresses.weth
      );
    });

    const isUnwrap = computed(() => {
      const config = getConfig();
      return (
        tokenOutAddress.value === ETHER.address &&
        tokenInAddress.value === config.addresses.weth
      );
    });

    const tradeDisabled = computed(() => {
      return priceImpact.value >= 0.05 ? !highPiAccepted.value : false;
    });

    // COMPOSABLES
    const {
      approving,
      approveV1,
      approveV2,
      allowanceState
    } = useTokenApproval(tokenInAddress, tokenInAmount, tokens);
    const {
      trading,
      trade,
      initSor,
      handleAmountChange,
      priceImpact,
      exactIn,
      sorReturn,
      latestTxHash,
      pools,
      fetchPools,
      poolsLoading
    } = useSor(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens,
      allowanceState,
      isWrap,
      isUnwrap
    );
    const { validationStatus, errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens
    );

    const requireApproval = computed(() => {
      if (isUnwrap.value) return false;
      return sorReturn.value.isV1swap
        ? !allowanceState.value.isUnlockedV1
        : !allowanceState.value.isUnlockedV2;
    });

    const title = computed(() => {
      if (isWrap.value) return 'wrap';
      if (isUnwrap.value) return 'unwrap';
      return 'trade';
    });

    const submitLabel = computed(() => {
      if (isWrap.value) return 'wrap';
      if (isUnwrap.value) return 'unwrap';
      return 'trade';
    });

    function connectWallet() {
      store.commit('web3/setAccountModal', true);
    }

    async function populateInitialTokens(): Promise<void> {
      let assetIn = router.currentRoute.value.params.assetIn as string;
      if (assetIn === ETHER.id) assetIn = ETHER.address;
      else if (isAddress(assetIn)) assetIn = getAddress(assetIn);
      let assetOut = router.currentRoute.value.params.assetOut as string;
      if (assetOut === ETHER.id) assetOut = ETHER.address;
      else if (isAddress(assetOut)) assetOut = getAddress(assetOut);

      tokenInAddress.value = assetIn || store.state.trade.inputAsset;
      tokenOutAddress.value = assetOut || store.state.trade.outputAsset;
    }

    async function approve(): Promise<void> {
      if (sorReturn.value.isV1swap) {
        await approveV1();
      } else {
        await approveV2();
      }
    }

    watch(getConfig, async () => {
      await initSor();
      await handleAmountChange();
    });

    watch(tokenInAddress, () => {
      store.commit('trade/setInputAsset', tokenInAddress.value);
      handleAmountChange();
    });

    watch(tokenOutAddress, () => {
      store.commit('trade/setOutputAsset', tokenOutAddress.value);
      handleAmountChange();
    });

    watch(latestTxHash, () => {
      // Refresh SOR pools
      fetchPools();
      txHash.value = latestTxHash.value;
      tradeSuccess.value = true;
    });

    populateInitialTokens();

    return {
      highPiAccepted,
      fNum,
      toFiat,
      tokens,
      title,
      submitLabel,
      isAuthenticated,
      connectWallet,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      exactIn,
      handleAmountChange,
      validationStatus,
      errorMessage,
      requireApproval,
      approving,
      sorReturn,
      pools,
      approve,
      trading,
      trade,
      txHash,
      tradeSuccess,
      priceImpact,
      isRequired,
      tradeDisabled,
      TradeSettingsContext,
      poolsLoading
    };
  }
});
</script>
