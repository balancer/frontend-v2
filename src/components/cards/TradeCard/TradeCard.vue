<template>
  <BalCard class="relative">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">{{ title }}</h4>
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
        v-else
        :label="'Preview trade'"
        :disabled="tradeDisabled"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="modalTradePreviewIsOpen = true"
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
  <teleport to="#modal">
    <TradePreviewModal
      :open="modalTradePreviewIsOpen"
      :is-v1-swap="sorReturn.isV1swap"
      :address-in="tokenInAddress"
      :amount-in="tokenInAmount"
      :address-out="tokenOutAddress"
      :amount-out="tokenOutAmount"
      :trading="trading"
      @trade="trade"
      @close="modalTradePreviewIsOpen = false"
    />
  </teleport>
</template>

<script lang="ts">
import { isRequired } from '@/lib/utils/validations';
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { isAddress, getAddress } from '@ethersproject/address';

import useAuth from '@/composables/useAuth';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation from '@/composables/trade/useValidation';
import useSor from '@/composables/trade/useSor';
import { ETHER } from '@/constants/tokenlists';

import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import TradePair from '@/components/cards/TradeCard/TradePair.vue';
import TradePreviewModal from '@/components/modals/TradePreviewModal.vue';
import TradeRoute from '@/components/cards/TradeCard/TradeRoute.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import GasReimbursement from './GasReimbursement.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    SuccessOverlay,
    TradePair,
    TradePreviewModal,
    TradeRoute,
    TradeSettingsPopover,
    GasReimbursement
  },

  setup() {
    const highPiAccepted = ref(false);
    const store = useStore();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { t } = useI18n();

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
    const modalTradePreviewIsOpen = ref(false);

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
    const { allowanceState } = useTokenApproval(
      tokenInAddress,
      tokenInAmount,
      tokens
    );
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
    const { errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens
    );

    const title = computed(() => {
      if (isWrap.value) return t('wrap');
      if (isUnwrap.value) return t('unwrap');
      return t('trade');
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
      modalTradePreviewIsOpen.value = false;
    });

    populateInitialTokens();

    return {
      highPiAccepted,
      title,
      isAuthenticated,
      connectWallet,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      exactIn,
      handleAmountChange,
      errorMessage,
      sorReturn,
      pools,
      trading,
      trade,
      txHash,
      modalTradePreviewIsOpen,
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
