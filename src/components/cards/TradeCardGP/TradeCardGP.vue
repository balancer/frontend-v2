<template>
  <BalCard class="relative">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">{{ title }} Gasless</h4>
        <TradeSettingsPopover :context="TradeSettingsContext.trade" />
      </div>
    </template>
    <div>
      <TradePairGP
        :token-in-amount-input="tokenInAmount"
        :token-in-address-input="tokenInAddress"
        :token-out-amount-input="tokenOutAmount"
        :token-out-address-input="tokenOutAddress"
        :is-sell="isSell"
        :price-impact="0"
        @token-in-amount-change="value => (tokenInAmount = value)"
        @token-in-address-change="value => (tokenInAddress = value)"
        @token-out-amount-change="value => (tokenOutAmount = value)"
        @token-out-address-change="value => (tokenOutAddress = value)"
        @is-sell-change="value => (isSell = value)"
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
        :label="'Preview trade'"
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
      :txHash="txHash"
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
      @trade="trade"
      @close="modalTradePreviewIsOpen = false"
      :order-id="orderId"
    />
  </teleport>
</template>

<script lang="ts">
import { isRequired } from '@/lib/utils/validations';
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { isAddress, getAddress } from '@ethersproject/address';

import useGnosisProtocol from '@/composables/useGnosisProtocol';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import { ETHER } from '@/constants/tokenlists';

import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';

import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import { useI18n } from 'vue-i18n';

import TradePairGP from './TradePairGP.vue';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import { FeeInformation, OrderMetaData } from '@/services/gnosis/types';
import { BigNumber } from '@ethersproject/bignumber';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';
import {
  signOrder,
  UnsignedOrder,
  calculateValidTo
} from '@/services/gnosis/signing';
import useWeb3 from '@/composables/useWeb3';
import { OrderKind } from '@gnosis.pm/gp-v2-contracts';
import useAuth from '@/composables/useAuth';
import {
  isOrderFinalized,
  normalizeTokenAddress
} from '@/services/gnosis/utils';

const DEFAULT_TRANSACTION_DEADLINE_IN_MINUTES = 20 * 60;
// TODO: get app id
const GNOSIS_APP_ID = 1;

const appData = '0x' + GNOSIS_APP_ID.toString(16).padStart(64, '0');

export default defineComponent({
  components: {
    SuccessOverlay,
    TradePairGP,
    TradePreviewModalGP,
    TradeSettingsPopover
  },

  setup() {
    const highPiAccepted = ref(false);
    const priceImpact = ref(0);
    const isSell = ref(true);
    const feeQuote = ref<FeeInformation | null>(null);
    const feeExceedsPrice = ref(false);
    const orderId = ref('');
    const orderMetadata = ref<OrderMetaData | null>(null);
    const store = useStore();
    const router = useRouter();
    const auth = useAuth();
    const { account, blockNumber } = useWeb3();

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
    const trading = ref(false);
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

    const isHighPriceImpact = computed(() => {
      return priceImpact.value >= 0.05 && !highPiAccepted.value;
    });
    const tokenInDecimals = computed<number>(
      () =>
        tokens.value[tokenInAddress.value]?.decimals ?? DEFAULT_TOKEN_DECIMALS
    );
    const tokenOutDecimals = computed(
      () =>
        tokens.value[tokenOutAddress.value]?.decimals ?? DEFAULT_TOKEN_DECIMALS
    );

    const tradeDisabled = computed(() => {
      if (
        errorMessage.value !== TradeValidation.VALID ||
        isHighPriceImpact.value ||
        feeExceedsPrice.value
      )
        return true;
      return false;
    });

    // COMPOSABLES
    useTokenApprovalGP(tokenInAddress, tokenInAmount, tokens);

    const { gnosisOperator } = useGnosisProtocol();

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

    const orderKind = computed(
      () => (isSell.value ? OrderKind.SELL : OrderKind.BUY) as OrderKind
    );

    const error = computed(() => {
      if (feeExceedsPrice.value) {
        return {
          header: 'Low amount',
          body: 'Fees exceeds from amount'
        };
      }
      if (isHighPriceImpact.value) {
        return {
          header: t('highPriceImpact'),
          body: t('highPriceImpactDetailed'),
          label: t('accept')
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

    function handleErrorButtonClick() {
      if (isHighPriceImpact.value) {
        highPiAccepted.value = true;
      }
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
    }

    async function trade() {
      try {
        const unsignedOrder: UnsignedOrder = {
          sellToken: normalizeTokenAddress(tokenInAddress.value),
          buyToken: normalizeTokenAddress(tokenOutAddress.value),
          sellAmount: parseUnits(
            tokenInAmount.value,
            tokenInDecimals.value
          ).toString(),
          buyAmount: parseUnits(
            tokenOutAmount.value,
            tokenOutDecimals.value
          ).toString(),
          validTo: calculateValidTo(DEFAULT_TRANSACTION_DEADLINE_IN_MINUTES),
          // TODO: get app id
          appData,
          feeAmount: feeQuote.value?.amount || '0',
          kind: orderKind.value,
          receiver: account.value,
          partiallyFillable: false // Always fill or kill
        };

        const signer = auth.web3.getSigner();

        const { signature, signingScheme } = await signOrder(
          unsignedOrder,
          signer
        );
        trading.value = true;

        // Call API
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
      }
    }

    async function updateQuotes() {
      feeExceedsPrice.value = false;

      const tokenAmount = isSell.value ? tokenInAmount : tokenOutAmount;
      const otherTokenAmount = isSell.value ? tokenOutAmount : tokenInAmount;
      const tokenDecimals = isSell.value
        ? tokenInDecimals.value
        : tokenOutDecimals.value;

      const sellToken = tokenInAddress.value;
      const buyToken = tokenOutAddress.value;
      const kind = orderKind.value;

      let amountToExchange = parseUnits(tokenAmount.value, tokenDecimals);

      if (parseFloat(tokenAmount.value) > 0) {
        try {
          // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
          const feeQuoteResult = await gnosisOperator.getFeeQuote({
            sellToken,
            buyToken,
            amount: amountToExchange.toString(),
            kind
          });

          if (feeQuoteResult != null) {
            if (isSell.value) {
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
                  isSell.value
                    ? priceQuoteResult.amount
                    : // add the fee for buy orders
                      BigNumber.from(priceQuoteResult.amount)
                        .add(feeQuoteResult.amount)
                        .toString(),
                  tokenDecimals
                );
              }
            }
          }
        } catch (e) {
          console.log('[Gnosis Quotes] Failed to update quotes', e);
        }
      }
    }

    watch(tokenInAddress, async () => {
      store.commit('trade/setInputAsset', tokenInAddress.value);
    });

    watch(tokenOutAddress, async () => {
      store.commit('trade/setOutputAsset', tokenOutAddress.value);
    });

    watch(tokenInAmount, () => {
      updateQuotes();
    });

    watch(tokenOutAmount, async () => {
      updateQuotes();
    });

    watch(blockNumber, async () => {
      if (orderId.value != '') {
        const order = await gnosisOperator.getOrder(orderId.value);
        if (isOrderFinalized(order)) {
          orderMetadata.value = order;
          trading.value = false;
          tradeSuccess.value = true;
          modalTradePreviewIsOpen.value = false;
          orderId.value = '';
        }
      }
    });

    populateInitialTokens();

    return {
      highPiAccepted,
      title,
      error,
      handleErrorButtonClick,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      errorMessage,
      txHash,
      modalTradePreviewIsOpen,
      tradeSuccess,
      isRequired,
      tradeDisabled,
      TradeSettingsContext,
      isSell,
      trade,
      trading,
      orderId,
      onSuccessOverlayClose
    };
  }
});
</script>
