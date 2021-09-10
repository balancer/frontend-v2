<template>
  <BalCard class="relative card-container" :shadow="tradeCardShadow" no-border>
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
        :effective-price-message="trading.effectivePriceMessage"
        @token-in-amount-change="value => (tokenInAmount = value)"
        @token-in-address-change="value => (tokenInAddress = value)"
        @token-out-amount-change="value => (tokenOutAmount = value)"
        @token-out-address-change="value => (tokenOutAddress = value)"
        @exact-in-change="value => (exactIn = value)"
        @change="trading.handleAmountChange"
      />
      <BalAlert
        v-if="error"
        class="p-3 mb-4"
        type="error"
        size="sm"
        :title="error.header"
        :description="error.body"
        :action-label="error.label"
        block
        @actionClick="handleErrorButtonClick"
      />
      <BalAlert
        v-else-if="warning"
        class="p-3 mb-4"
        type="warning"
        size="sm"
        :title="warning.header"
        :description="warning.body"
        block
      />
      <BalBtn
        v-if="trading.isLoading.value"
        :loading="true"
        :loading-label="
          trading.isGnosisTrade.value ? $t('loadingBestPrice') : $t('loading')
        "
        block
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        :disabled="tradeDisabled"
        color="gradient"
        block
        @click.prevent="handlePreviewButton"
      />
      <div
        class="mt-6 bg-gray-50 rounded text-sm p-3 grid gap-2 grid-flow-col text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        v-if="trading.isBalancerTrade.value"
      >
        <LightBulbIcon />
        <!-- TODO: translate -->
        <span
          >Trades from ETH route through Balancer liquidity pools and incur gas
          fees.
          <a @click="switchToWETH()" class="text-blue-500">
            Trade from WETH
          </a>
          to avoid gas.
        </span>
      </div>
    </div>
  </BalCard>
  <teleport to="#modal">
    <TradePreviewModalGP
      v-if="modalTradePreviewIsOpen"
      :trading="trading"
      @trade="trade"
      @close="handlePreviewModalClose"
    />
  </teleport>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
import { isAddress, getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import useTrading from '@/composables/trade/useTrading';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useTokens from '@/composables/useTokens';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import { TOKENS } from '@/constants/tokens';

import { isRequired } from '@/lib/utils/validations';
import { WrapType } from '@/lib/utils/balancer/wrapper';

import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

import { configService } from '@/services/config/config.service';

import TradePairGP from './TradePairGP.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';

const { nativeAsset } = configService.network;

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
    const { bp } = useBreakpoints();
    const { fNum } = useNumbers();
    const { appNetworkConfig } = useWeb3();
    const { tokens } = useTokens();

    // DATA
    const exactIn = ref(true);
    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const modalTradePreviewIsOpen = ref(false);
    const dismissedErrors = ref({
      highPriceImpact: false
    });

    const tradeCardShadow = computed(() => {
      switch (bp.value) {
        case 'xs':
          return 'none';
        case 'sm':
          return 'lg';
        default:
          return 'xl';
      }
    });

    const trading = useTrading(
      exactIn,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );

    // COMPUTED
    const { errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );

    const isHighPriceImpact = computed(
      () =>
        trading.sor.validationErrors.value.highPriceImpact &&
        !dismissedErrors.value.highPriceImpact
    );

    const tradeDisabled = computed(() => {
      const hasValidationErrors = errorMessage.value !== TradeValidation.VALID;
      const hasGnosisErrors =
        trading.isGnosisTrade.value && trading.gnosis.hasValidationErrors.value;
      const hasBalancerErrors =
        trading.isBalancerTrade.value && isHighPriceImpact.value;

      return hasValidationErrors || hasGnosisErrors || hasBalancerErrors;
    });

    useTokenApproval(tokenInAddress, tokenInAmount, tokens);
    useRelayerApproval(Relayer.GNOSIS, trading.isGnosisTrade);

    const title = computed(() => {
      if (trading.wrapType.value === WrapType.Wrap) {
        return `${t('wrap')} ${trading.tokenIn.value.symbol}`;
      }
      if (trading.wrapType.value === WrapType.Unwrap) {
        return `${t('unwrap')} ${trading.tokenOut.value.symbol}`;
      }
      return t('trade');
    });

    const error = computed(() => {
      switch (errorMessage.value) {
        case TradeValidation.NO_NATIVE_ASSET: {
          return {
            header: t('noNativeAsset', [nativeAsset.symbol]),
            body: t('noNativeAssetDetailed', [
              nativeAsset.symbol,
              configService.network.chainName
            ])
          };
        }
        case TradeValidation.NO_BALANCE: {
          return {
            header: t('insufficientBalance'),
            body: t('insufficientBalanceDetailed')
          };
        }
        case TradeValidation.NO_LIQUIDITY: {
          return {
            header: t('insufficientLiquidity'),
            body: t('insufficientLiquidityDetailed')
          };
        }
        default:
      }

      if (trading.isGnosisTrade.value) {
        if (trading.gnosis.validationErrors.value.feeExceedsPrice) {
          return {
            header: t('gnosisErrors.lowAmount.header'),
            body: t('gnosisErrors.lowAmount.body')
          };
        }
        if (trading.gnosis.validationErrors.value.priceExceedsBalance) {
          return {
            header: t('gnosisErrors.lowBalance.header', [
              trading.tokenIn.value.symbol
            ]),
            body: t('gnosisErrors.lowBalance.body', [
              trading.tokenIn.value.symbol,
              fNum(
                formatUnits(
                  trading.getQuote().maximumInAmount,
                  trading.tokenIn.value.decimals
                ),
                'token'
              ),
              fNum(trading.slippageBufferRate.value, 'percent')
            ])
          };
        }
      } else if (trading.isBalancerTrade.value) {
        if (isHighPriceImpact.value) {
          return {
            header: t('highPriceImpact'),
            body: t('highPriceImpactDetailed'),
            label: t('accept')
          };
        }
      }

      return undefined;
    });

    const warning = computed(() => {
      if (trading.isGnosisTrade.value) {
        if (trading.gnosis.warnings.value.highFees) {
          return {
            header: t('gnosisWarnings.highFees.header'),
            body: t('gnosisWarnings.highFees.body')
          };
        }
      }

      return undefined;
    });

    // METHODS
    function trade() {
      trading.trade(() => {
        tokenInAmount.value = '';
        tokenOutAmount.value = '';
        modalTradePreviewIsOpen.value = false;
      });
    }

    function handleErrorButtonClick() {
      if (trading.sor.validationErrors.value.highPriceImpact) {
        dismissedErrors.value.highPriceImpact = true;
      }
    }

    async function populateInitialTokens(): Promise<void> {
      let assetIn = router.currentRoute.value.params.assetIn as string;

      if (assetIn === nativeAsset.deeplinkId) {
        assetIn = nativeAsset.address;
      } else if (isAddress(assetIn)) {
        assetIn = getAddress(assetIn);
      }

      let assetOut = router.currentRoute.value.params.assetOut as string;

      if (assetOut === nativeAsset.deeplinkId) {
        assetOut = nativeAsset.address;
      } else if (isAddress(assetOut)) {
        assetOut = getAddress(assetOut);
      }

      tokenInAddress.value = assetIn || store.state.trade.inputAsset;
      tokenOutAddress.value = assetOut || store.state.trade.outputAsset;
    }

    function switchToWETH() {
      tokenInAddress.value = TOKENS.AddressMap[appNetworkConfig.key].WETH;
    }

    function handlePreviewButton() {
      trading.resetSubmissionError();

      modalTradePreviewIsOpen.value = true;
    }

    function handlePreviewModalClose() {
      trading.resetSubmissionError();

      modalTradePreviewIsOpen.value = false;
    }

    // INIT
    populateInitialTokens();

    return {
      // constants
      TOKENS,
      // context
      TradeSettingsContext,

      // data
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      modalTradePreviewIsOpen,
      exactIn,
      trading,

      // computed
      title,
      error,
      warning,
      errorMessage,
      isRequired,
      tradeDisabled,
      tradeCardShadow,
      handlePreviewButton,
      handlePreviewModalClose,

      // methods
      trade,
      switchToWETH,
      handleErrorButtonClick
    };
  }
});
</script>
<style scoped>
/* This is needed because the trade settings popover overflows */
.card-container {
  overflow: unset;
}
</style>
