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
      @trade="trade"
      @close="modalTradePreviewIsOpen = false"
    />
  </teleport>
</template>

<script lang="ts">
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import BigNumber from 'bignumber.js';

import { useI18n } from 'vue-i18n';
import { isAddress, getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { FeeInformation, OrderMetaData } from '@/services/gnosis/types';
import {
  signOrder,
  UnsignedOrder,
  calculateValidTo
} from '@/services/gnosis/signing';
import { OrderKind } from '@gnosis.pm/gp-v2-contracts';
import {
  isOrderFinalized,
  normalizeTokenAddress
} from '@/services/gnosis/utils';

import useNotify from '@/composables/useNotify';
import useAuth from '@/composables/useAuth';
import useGnosisProtocol from '@/composables/useGnosisProtocol';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import useTrading from '@/composables/trade/useTrading';
import useWeb3 from '@/composables/useWeb3';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';

import { ETHER } from '@/constants/tokenlists';

import { bnum } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import { unwrap, wrap } from '@/lib/utils/balancer/wrapper';

import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

import TradePairGP from './TradePairGP.vue';

// TODO: get app id
const GNOSIS_APP_ID = 2;

const appData = '0x' + GNOSIS_APP_ID.toString(16).padStart(64, '0');

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
    const auth = useAuth();
    const { account, blockNumber, explorer } = useWeb3();
    const { txListener } = useNotify();
    const { t } = useI18n();
    const { gnosisOperator, gnosisExplorer } = useGnosisProtocol();

    // DATA
    const exactIn = ref(true);
    const feeQuote = ref<FeeInformation | null>(null);
    const feeExceedsPrice = ref(false);
    const orderId = ref('');
    const orderMetadata = ref<OrderMetaData | null>(null);
    const updatingQuotes = ref(false);
    const latestTxHash = ref('');
    const txHash = ref('');
    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const maximumInAmountScaled = ref('');
    const minimumOutAmountScaled = ref('');
    const trading = ref(false);
    const modalTradePreviewIsOpen = ref(false);

    const {
      isWrap,
      isUnwrap,
      requiresApproval,
      getConfig,
      tokenInAmountScaled,
      tokenOutAmountScaled,
      tokens,
      tokenIn,
      tokenOut,
      effectivePriceMessage
    } = useTrading(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );

    // COMPUTED
    const slippageBufferRate = computed(() =>
      parseFloat(store.state.app.slippage)
    );

    const explorerLink = computed(() =>
      orderId.value != ''
        ? gnosisExplorer.orderLink(orderId.value)
        : explorer.txLink(txHash.value)
    );

    const feeAmountInTokenScaled = computed(
      () => feeQuote.value?.amount ?? '0'
    );
    const feeAmountOutTokenScaled = computed(() =>
      tokenOutAmountScaled.value
        .div(tokenInAmountScaled.value)
        .times(feeAmountInTokenScaled.value)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()
    );

    const tradeDisabled = computed(() => {
      if (errorMessage.value !== TradeValidation.VALID || feeExceedsPrice.value)
        return true;
      return false;
    });

    useTokenApprovalGP(tokenInAddress, tokenInAmount);

    const {
      errorMessage,
      isValidTokenAmount,
      tokensAmountsValid
    } = useValidation(
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

    const appTransactionDeadline = computed<number>(
      () => store.state.app.transactionDeadline
    );

    const orderKind = computed(
      () => (exactIn.value ? OrderKind.SELL : OrderKind.BUY) as OrderKind
    );

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
      if (assetIn === ETHER.deeplinkId) assetIn = ETHER.address;
      else if (isAddress(assetIn)) assetIn = getAddress(assetIn);
      let assetOut = router.currentRoute.value.params.assetOut as string;
      if (assetOut === ETHER.deeplinkId) assetOut = ETHER.address;
      else if (isAddress(assetOut)) assetOut = getAddress(assetOut);

      tokenInAddress.value = assetIn || store.state.trade.inputAsset;
      tokenOutAddress.value = assetOut || store.state.trade.outputAsset;
    }

    async function handleETH(action: 'wrap' | 'unwrap') {
      try {
        trading.value = true;

        const { chainId } = getConfig();

        const fn = action === 'wrap' ? wrap : unwrap;
        const tx = await fn(chainId, auth.web3, tokenInAmountScaled.value);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }

    async function postSignedOrder() {
      try {
        trading.value = true;

        const unsignedOrder: UnsignedOrder = {
          sellToken: normalizeTokenAddress(tokenInAddress.value),
          buyToken: normalizeTokenAddress(tokenOutAddress.value),
          sellAmount: bnum(
            exactIn.value
              ? tokenInAmountScaled.value
              : maximumInAmountScaled.value
          )
            .minus(feeAmountInTokenScaled.value)
            .toString(),
          buyAmount: exactIn.value
            ? minimumOutAmountScaled.value.toString()
            : tokenOutAmountScaled.value.toString(),
          validTo: calculateValidTo(appTransactionDeadline.value),
          appData,
          feeAmount: feeAmountInTokenScaled.value,
          kind: orderKind.value,
          receiver: account.value,
          partiallyFillable: false // Always fill or kill
        };

        const signer = auth.web3.getSigner();

        const { signature, signingScheme } = await signOrder(
          unsignedOrder,
          signer
        );

        orderId.value = await gnosisOperator.postSignedOrder({
          order: {
            ...unsignedOrder,
            signature,
            receiver: account.value,
            signingScheme
          },
          owner: account.value
        });
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }

    async function trade() {
      if (isWrap.value) {
        handleETH('wrap');
      } else if (isUnwrap.value) {
        handleETH('unwrap');
      } else {
        postSignedOrder();
      }
    }

    function tradeTxListener(hash: string) {
      txListener(hash, {
        onTxConfirmed: () => {
          trading.value = false;
          latestTxHash.value = hash;
        },
        onTxCancel: () => {
          trading.value = false;
        },
        onTxFailed: () => {
          trading.value = false;
        }
      });
    }

    async function updateQuotes() {
      if (
        isValidTokenAmount(
          exactIn.value ? tokenInAmount.value : tokenOutAmount.value
        )
      ) {
        const sellToken = tokenInAddress.value;
        const buyToken = tokenOutAddress.value;
        const kind = orderKind.value;
        const amountToExchange = exactIn.value
          ? tokenInAmountScaled.value
          : tokenOutAmountScaled.value;

        updatingQuotes.value = true;
        feeExceedsPrice.value = false;

        try {
          const queryParams = {
            sellToken,
            buyToken,
            amount: amountToExchange.toString(),
            kind
          };
          // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
          const feeQuoteResult = await gnosisOperator.getFeeQuote(queryParams);

          if (feeQuoteResult != null) {
            if (exactIn.value) {
              feeExceedsPrice.value = amountToExchange
                .minus(feeQuoteResult.amount)
                .isNegative();
            }
            if (!feeExceedsPrice.value) {
              const priceQuoteResult = await gnosisOperator.getPriceQuote(
                queryParams
              );

              if (priceQuoteResult != null && priceQuoteResult.amount != null) {
                feeQuote.value = feeQuoteResult;

                if (exactIn.value) {
                  tokenOutAmount.value = formatUnits(
                    priceQuoteResult.amount,
                    tokenOut.value.decimals
                  );

                  minimumOutAmountScaled.value = tokenOutAmountScaled.value
                    .minus(feeAmountOutTokenScaled.value)
                    .div(1 + slippageBufferRate.value)
                    .integerValue(BigNumber.ROUND_DOWN)
                    .toString();
                } else {
                  maximumInAmountScaled.value = tokenInAmountScaled.value
                    .plus(feeAmountInTokenScaled.value)
                    .times(1 + slippageBufferRate.value)
                    .integerValue(BigNumber.ROUND_DOWN)
                    .toString();

                  tokenInAmount.value = formatUnits(
                    priceQuoteResult.amount,
                    tokenIn.value.decimals
                  );
                }
              }
            }
          }
        } catch (e) {
          console.log('[Gnosis Quotes] Failed to update quotes', e);
        }
        updatingQuotes.value = false;
      }
    }

    // WATCHERS
    watch(tokenInAddress, async () => {
      store.commit('trade/setInputAsset', tokenInAddress.value);
      feeQuote.value = null;
      updateQuotes();
    });

    watch(tokenOutAddress, async () => {
      store.commit('trade/setOutputAsset', tokenOutAddress.value);
      feeQuote.value = null;
      updateQuotes();
    });

    watch(tokenInAmount, () => {
      if (tokenInAmount.value !== '') {
        updateQuotes();
      } else {
        tokenOutAmount.value = '';
      }
    });

    watch(tokenOutAmount, async () => {
      if (tokenOutAmount.value !== '') {
        updateQuotes();
      } else {
        tokenInAmount.value = '';
      }
    });

    watch(blockNumber, async () => {
      updateQuotes();

      if (orderId.value != '') {
        const order = await gnosisOperator.getOrder(orderId.value);
        if (isOrderFinalized(order)) {
          orderMetadata.value = order;
          trading.value = false;
          modalTradePreviewIsOpen.value = false;
        }
      }
    });

    watch(latestTxHash, () => {
      txHash.value = latestTxHash.value;
      modalTradePreviewIsOpen.value = false;
    });

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
      txHash,
      modalTradePreviewIsOpen,
      exactIn,
      orderId,

      // computed
      explorerLink,
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
      updatingQuotes,
      trade
    };
  }
});
</script>
