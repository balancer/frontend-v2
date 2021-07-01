<template>
  <BalCard class="relative">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">{{ title }}</h4>
        <TradeSettingsPopover :context="TradeSettingsContext.trade" />
      </div>
    </template>
    <div>
      <TradePairGP
        :token-in-amount-input="tokenInAmount"
        :token-in-address-input="tokenInAddress"
        :token-out-amount-input="tokenOutAmount"
        :token-out-address-input="tokenOutAddress"
        :exact-in="exactIn"
        @token-in-amount-change="value => (tokenInAmount = value)"
        @token-in-address-change="value => (tokenInAddress = value)"
        @token-out-amount-change="value => (tokenOutAmount = value)"
        @token-out-address-change="value => (tokenOutAddress = value)"
        @exact-in-change="value => (exactIn = value)"
      />
      <BalAlert
        v-if="error"
        class="mb-4"
        type="error"
        size="sm"
        :title="error.header"
        :description="error.body"
        :action-label="error.label"
        block
        @actionClick="handleErrorButtonClick"
      />
      <BalBtn
        :label="$t('previewTrade')"
        :disabled="tradeDisabled"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="modalTradePreviewIsOpen = true"
      />
    </div>
  </BalCard>
  <teleport to="#modal">
    <TradePreviewModalGP
      v-if="shouldOpenTradePreview"
      :exact-in="exactIn"
      :trading="trading"
      :token-in="tokenIn"
      :token-out="tokenOut"
      :token-in-amount="tokenInAmount"
      :token-out-amount="tokenOutAmount"
      :effective-price-message="effectivePriceMessage"
      :requires-approval="requiresApproval"
      :fee-amount-in-token-scaled="feeAmountInTokenScaled"
      :fee-amount-out-token-scaled="feeAmountOutTokenScaled"
      :minimum-out-amount-scaled="minimumOutAmountScaled"
      :maximum-in-amount-scaled="maximumInAmountScaled"
      :trade-route="tradeRoute"
      @trade="trade"
      @close="modalTradePreviewIsOpen = false"
    />
  </teleport>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
import { isAddress, getAddress } from '@ethersproject/address';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import useTrading from '@/composables/trade/useTrading';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';

import { ETHER } from '@/constants/tokenlists';

import { isRequired } from '@/lib/utils/validations';

import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

import TradePairGP from './TradePairGP.vue';

export default defineComponent({
  components: {
    TradePairGP,
    TradePreviewModalGP,
    TradeSettingsPopover
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();

    // DATA
    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const modalTradePreviewIsOpen = ref(false);

    const {
      tradeRoute,
      requiresApproval,
      tokens,
      tokenIn,
      tokenOut,
      effectivePriceMessage,
      exactIn,
      feeExceedsPrice,
      trading,
      feeAmountInTokenScaled,
      feeAmountOutTokenScaled,
      minimumOutAmountScaled,
      maximumInAmountScaled,
      trade
    } = useTrading(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );

    // COMPUTED

    const tradeDisabled = computed(() => {
      if (errorMessage.value !== TradeValidation.VALID || feeExceedsPrice.value)
        return true;
      return false;
    });

    useTokenApprovalGP(tokenInAddress, tokenInAmount);

    const { errorMessage, tokensAmountsValid } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens
    );

    const title = computed(() => {
      if (tradeRoute.value === 'wrapETH') {
        return `${t('wrap')} ${ETHER.symbol}`;
      }
      if (tradeRoute.value === 'unwrapETH') {
        return `${t('unwrap')} ${ETHER.symbol}`;
      }
      return t('trade');
    });

    const shouldOpenTradePreview = computed(
      () => modalTradePreviewIsOpen.value && tokensAmountsValid.value
    );

    const error = computed(() => {
      if (feeExceedsPrice.value) {
        return {
          header: 'Low amount',
          body: 'Fees exceeds from amount'
        };
      }
      switch (errorMessage.value) {
        case TradeValidation.NO_ETHER:
          return {
            header: t('noEth'),
            body: t('noEthDetailed')
          };
        case TradeValidation.NO_BALANCE:
          return {
            header: t('insufficientBalance'),
            body: t('insufficientBalanceDetailed')
          };
        case TradeValidation.NO_LIQUIDITY:
          return {
            header: t('insufficientLiquidity'),
            body: t('insufficientLiquidityDetailed')
          };
        default:
          return undefined;
      }
    });

    // METHODS
    function handleErrorButtonClick() {
      console.log('TOOD: implement if needed');
    }

    async function populateInitialTokens(): Promise<void> {
      let assetIn = router.currentRoute.value.params.assetIn as string;

      if (assetIn === ETHER.deeplinkId) {
        assetIn = ETHER.address;
      } else if (isAddress(assetIn)) {
        assetIn = getAddress(assetIn);
      }

      let assetOut = router.currentRoute.value.params.assetOut as string;

      if (assetOut === ETHER.deeplinkId) {
        assetOut = ETHER.address;
      } else if (isAddress(assetOut)) {
        assetOut = getAddress(assetOut);
      }

      tokenInAddress.value = assetIn || store.state.trade.inputAsset;
      tokenOutAddress.value = assetOut || store.state.trade.outputAsset;
    }

    // INIT
    populateInitialTokens();

    return {
      // context
      TradeSettingsContext,

      // data
      tokenInAddress,
      tokenInAmount,
      tokenIn,
      tokenOut,
      tokenOutAddress,
      tokenOutAmount,
      modalTradePreviewIsOpen,
      exactIn,

      // computed
      title,
      error,
      errorMessage,
      isRequired,
      tradeDisabled,
      trading,
      requiresApproval,
      shouldOpenTradePreview,
      effectivePriceMessage,
      feeAmountInTokenScaled,
      feeAmountOutTokenScaled,
      minimumOutAmountScaled,
      maximumInAmountScaled,

      // methods
      handleErrorButtonClick,
      trade,
      tradeRoute
    };
  }
});
</script>
