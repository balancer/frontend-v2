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
    <SuccessOverlay
      v-if="tradeSuccess"
      :title="$t('tradeSettled')"
      :description="$t('tradeSuccess')"
      :closeLabel="$t('close')"
      :explorerLink="explorerLink"
      @close="onSuccessOverlayClose"
    />
  </BalCard>
  <teleport to="#modal">
    <TradePreviewModalGP
      :open="modalTradePreviewIsOpen"
      :address-in="tokenInAddress"
      :amount-in="tokenInAmount"
      :address-out="tokenOutAddress"
      :amount-out="tokenOutAmount"
      :trading="trading"
      :order-id="orderId"
      :formatted-fee-amount="formattedFeeAmount"
      :exact-in="exactIn"
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
import { formatUnits, parseUnits } from '@ethersproject/units';

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

import useTokens from '@/composables/useTokens';
import useNotify from '@/composables/useNotify';
import useAuth from '@/composables/useAuth';
import useGnosisProtocol from '@/composables/useGnosisProtocol';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import useWeb3 from '@/composables/useWeb3';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';

import { ETHER } from '@/constants/tokenlists';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';

import { bnum, scale } from '@/lib/utils';
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
    SuccessOverlay,
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
    const tradeSuccess = ref(false);
    const trading = ref(false);
    const modalTradePreviewIsOpen = ref(false);

    // COMPUTED
    // TODO use web3 composable
    const getConfig = () => store.getters['web3/getConfig']();
    const { allTokensIncludeEth: tokens } = useTokens();
    const slippageBufferRate = computed(() =>
      parseFloat(store.state.app.slippage)
    );

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

    const tokenInDecimals = computed<number>(
      () =>
        tokens.value[tokenInAddress.value]?.decimals ?? DEFAULT_TOKEN_DECIMALS
    );
    const tokenOutDecimals = computed(
      () =>
        tokens.value[tokenOutAddress.value]?.decimals ?? DEFAULT_TOKEN_DECIMALS
    );

    const explorerLink = computed(() =>
      orderId.value != ''
        ? gnosisExplorer.orderLink(orderId.value)
        : explorer.txLink(txHash.value)
    );

    const feeAmount = computed(() => feeQuote.value?.amount || '0');
    const formattedFeeAmount = computed(() =>
      formatUnits(feeAmount.value, tokenInDecimals.value)
    );

    const tradeDisabled = computed(() => {
      if (errorMessage.value !== TradeValidation.VALID || feeExceedsPrice.value)
        return true;
      return false;
    });

    useTokenApprovalGP(tokenInAddress, tokenInAmount, tokens);

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
      return t('tradeGasless');
    });

    const appTransactionDeadline = computed<number>(
      () => store.state.app.transactionDeadline
    );

    const orderKind = computed(
      () => (exactIn.value ? OrderKind.SELL : OrderKind.BUY) as OrderKind
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
      if (assetIn === ETHER.id) assetIn = ETHER.address;
      else if (isAddress(assetIn)) assetIn = getAddress(assetIn);
      let assetOut = router.currentRoute.value.params.assetOut as string;
      if (assetOut === ETHER.id) assetOut = ETHER.address;
      else if (isAddress(assetOut)) assetOut = getAddress(assetOut);

      tokenInAddress.value = assetIn || store.state.trade.inputAsset;
      tokenOutAddress.value = assetOut || store.state.trade.outputAsset;
    }

    function onSuccessOverlayClose() {
      tradeSuccess.value = false;
      orderMetadata.value = null;
      txHash.value = '';
      orderId.value = '';
    }

    async function wrapETH(amount: BigNumber) {
      try {
        trading.value = true;

        const { chainId } = getConfig();
        const tx = await wrap(chainId, auth.web3, amount);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }

    async function unwrapETH(amount: BigNumber) {
      try {
        trading.value = true;

        const { chainId } = getConfig();
        const tx = await unwrap(chainId, auth.web3, amount);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }

    async function postSignedOrder(
      tokenInAmountScaled: BigNumber,
      tokenOutAmountScaled: BigNumber
    ) {
      try {
        trading.value = true;

        let sellAmount: string;
        let buyAmount: string;

        if (exactIn.value) {
          sellAmount = tokenInAmountScaled.toString();
          buyAmount = tokenOutAmountScaled
            .div(1 + slippageBufferRate.value)
            .integerValue(BigNumber.ROUND_DOWN)
            .toString();
        } else {
          sellAmount = tokenInAmountScaled
            .times(1 + slippageBufferRate.value)
            .integerValue(BigNumber.ROUND_DOWN)
            .toString();
          buyAmount = tokenOutAmountScaled.toString();
        }

        const unsignedOrder: UnsignedOrder = {
          sellToken: normalizeTokenAddress(tokenInAddress.value),
          buyToken: normalizeTokenAddress(tokenOutAddress.value),
          sellAmount,
          buyAmount,
          validTo: calculateValidTo(appTransactionDeadline.value),
          appData,
          feeAmount: feeAmount.value,
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
      const tokenInAmountScaled = scale(
        bnum(tokenInAmount.value),
        tokenInDecimals.value
      );

      const tokenOutAmountScaled = scale(
        bnum(tokenOutAmount.value),
        tokenOutDecimals.value
      );

      if (isWrap.value) {
        wrapETH(tokenInAmountScaled);
      } else if (isUnwrap.value) {
        unwrapETH(tokenInAmountScaled);
      } else {
        postSignedOrder(tokenInAmountScaled, tokenOutAmountScaled);
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
      const tokenAmount = exactIn.value ? tokenInAmount : tokenOutAmount;
      const otherTokenAmount = exactIn.value ? tokenOutAmount : tokenInAmount;

      if (tokenAmount.value !== '' && parseFloat(tokenAmount.value) > 0) {
        updatingQuotes.value = true;
        feeExceedsPrice.value = false;

        const tokenDecimals = exactIn.value
          ? tokenInDecimals.value
          : tokenOutDecimals.value;

        const sellToken = tokenInAddress.value;
        const buyToken = tokenOutAddress.value;
        const kind = orderKind.value;
        let amountToExchange = parseUnits(tokenAmount.value, tokenDecimals);
        try {
          // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
          const feeQuoteResult = await gnosisOperator.getFeeQuote({
            sellToken,
            buyToken,
            amount: amountToExchange.toString(),
            kind
          });

          if (feeQuoteResult != null) {
            if (exactIn.value) {
              // deduct fee if its a sell order
              amountToExchange = amountToExchange.sub(feeQuoteResult.amount);

              feeExceedsPrice.value = amountToExchange.isNegative();
            }
            if (!feeExceedsPrice.value) {
              const priceQuoteResult = await gnosisOperator.getPriceQuote({
                sellToken,
                buyToken,
                amount: amountToExchange.toString(),
                kind
              });

              if (priceQuoteResult != null && priceQuoteResult.amount != null) {
                feeQuote.value = feeQuoteResult;

                otherTokenAmount.value = formatUnits(
                  priceQuoteResult.amount,
                  tokenDecimals
                );
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
          tradeSuccess.value = true;
          modalTradePreviewIsOpen.value = false;
        }
      }
    });

    watch(latestTxHash, () => {
      txHash.value = latestTxHash.value;
      tradeSuccess.value = true;
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
      tokenOutAddress,
      tokenOutAmount,
      txHash,
      modalTradePreviewIsOpen,
      exactIn,
      orderId,

      // computed
      explorerLink,
      formattedFeeAmount,
      title,
      error,
      errorMessage,
      isRequired,
      tradeDisabled,
      trading,
      tradeSuccess,

      // methods
      handleErrorButtonClick,
      updatingQuotes,
      trade,
      onSuccessOverlayClose
    };
  }
});
</script>
