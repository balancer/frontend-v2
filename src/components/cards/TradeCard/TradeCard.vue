<template>
  <BalCard class="relative card-container" :shadow="tradeCardShadow" noBorder>
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h4>{{ title }}</h4>
        <TradeSettingsPopover
          :context="TradeSettingsContext.trade"
          :isGasless="trading.tradeGasless.value"
        />
      </div>
    </template>
    <div>
      <TradePair
        v-model:tokenInAmount="tokenInAmount"
        v-model:tokenInAddress="tokenInAddress"
        v-model:tokenOutAmount="tokenOutAmount"
        v-model:tokenOutAddress="tokenOutAddress"
        v-model:exactIn="exactIn"
        :tradeLoading="
          trading.isBalancerTrade.value ? trading.isLoading.value : false
        "
        :effectivePriceMessage="trading.effectivePriceMessage"
        class="mb-4"
        @amount-change="trading.handleAmountChange"
      />
      <BalAlert
        v-if="error"
        class="p-3 mb-4"
        type="error"
        size="sm"
        :title="error.header"
        :description="error.body"
        :actionLabel="error.label"
        block
        @action-click="handleErrorButtonClick"
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
        loading
        disabled
        :loadingLabel="
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
        v-if="trading.isGnosisSupportedOnNetwork.value"
        class="flex items-center mt-5 h-8 text-sm"
      >
        <Transition name="fade" mode="out-in">
          <div
            v-if="trading.isGaslessTradingDisabled.value"
            class="text-secondary"
          >
            <div class="flex gap-2 items-center">
              <span class="text-lg">⛽</span>
              <Transition name="fade" mode="out-in">
                <p v-if="trading.isWrap.value">
                  {{ $t('tradeToggle.wrapEth') }}
                </p>
                <p v-else-if="trading.isUnwrap.value">
                  {{ $t('tradeToggle.unwrapEth') }}
                </p>
                <p v-else>
                  {{ $t('tradeToggle.fromEth') }}
                </p>
              </Transition>
            </div>
          </div>

          <div v-else>
            <div class="flex items-center trade-gasless">
              <BalTooltip
                width="64"
                :disabled="!trading.isGaslessTradingDisabled.value"
              >
                <template #activator>
                  <BalToggle
                    name="tradeGasless"
                    :checked="trading.tradeGasless.value"
                    :disabled="trading.isGaslessTradingDisabled.value"
                    @toggle="trading.toggleTradeGasless"
                  />
                </template>
                <div
                  v-text="
                    trading.isWrapUnwrapTrade.value
                      ? $t('tradeGaslessToggle.disabledTooltip.wrapUnwrap')
                      : $t('tradeGaslessToggle.disabledTooltip.eth')
                  "
                />
              </BalTooltip>
              <Transition name="fade" mode="out-in">
                <span
                  v-if="trading.tradeGasless.value"
                  class="pl-2 text-sm text-gray-600 dark:text-gray-400"
                  >{{ $t('tradeToggle.tradeGasless') }}</span
                >
                <span
                  v-else
                  class="pl-2 text-sm text-gray-600 dark:text-gray-400"
                  >{{ $t('tradeToggle.tradeWithGas') }}</span
                >
              </Transition>
              <BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div v-html="$t('tradeGaslessToggle.tooltip')" />
              </BalTooltip>
            </div>
          </div>
        </Transition>
      </div>
      <TradeRoute
        v-if="alwaysShowRoutes"
        :addressIn="trading.tokenIn.value.address"
        :amountIn="trading.tokenInAmountInput.value"
        :addressOut="trading.tokenOut.value.address"
        :amountOut="trading.tokenOutAmountInput.value"
        :pools="pools"
        :sorReturn="trading.sor.sorReturn.value"
        class="mt-4"
      />
    </div>
  </BalCard>
  <teleport to="#modal">
    <TradePreviewModalGP
      v-if="modalTradePreviewIsOpen"
      :trading="trading"
      :error="error"
      :warning="warning"
      @trade="trade"
      @close="handlePreviewModalClose"
    />
  </teleport>
</template>

<script lang="ts">
import { SubgraphPoolBase } from '@balancer-labs/sdk';
import { Pool } from '@balancer-labs/sor/dist/types';
import { getAddress, isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import { useTradeState } from '@/composables/trade/useTradeState';
import useTrading from '@/composables/trade/useTrading';
import useValidation, {
  TradeValidation,
} from '@/composables/trade/useValidation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { TOKENS } from '@/constants/tokens';
import { lsGet } from '@/lib/utils';
import { WrapType } from '@/lib/utils/balancer/wrapper';
import { isRequired } from '@/lib/utils/validations';
import { ApiErrorCodes } from '@/services/gnosis/errors/OperatorError';
import useWeb3 from '@/services/web3/useWeb3';
import TradePair from './TradePair.vue';
import TradeRoute from './TradeRoute.vue';
export default defineComponent({
  components: {
    TradePair,
    TradePreviewModalGP,
    TradeRoute,
    TradeSettingsPopover,
  },
  setup() {
    // COMPOSABLES
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    const { bp } = useBreakpoints();
    const { fNum2 } = useNumbers();
    const { appNetworkConfig } = useWeb3();
    const { nativeAsset } = useTokens();
    const {
      tokenInAddress,
      tokenOutAddress,
      tokenInAmount,
      tokenOutAmount,
      setTokenInAddress,
      setTokenOutAddress,
      setTokenInAmount,
      setTokenOutAmount,
      setInitialized,
    } = useTradeState();
    // DATA
    const exactIn = ref(true);
    const modalTradePreviewIsOpen = ref(false);
    const dismissedErrors = ref({
      highPriceImpact: false,
    });
    const alwaysShowRoutes = lsGet('alwaysShowRoutes', false);
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
      const hasAmountsError = !tokenInAmount.value || !tokenOutAmount.value;
      const hasGnosisErrors =
        trading.isGnosisTrade.value && trading.gnosis.hasValidationError.value;
      const hasBalancerErrors =
        trading.isBalancerTrade.value && isHighPriceImpact.value;
      return hasAmountsError || hasGnosisErrors || hasBalancerErrors;
    });
    const title = computed(() => {
      if (trading.wrapType.value === WrapType.Wrap) {
        return `${t('wrap')} ${trading.tokenIn.value.symbol}`;
      }
      if (trading.wrapType.value === WrapType.Unwrap) {
        return `${t('unwrap')} ${trading.tokenOut.value.symbol}`;
      }
      return t('trade');
    });
    const pools = computed<(Pool | SubgraphPoolBase)[]>(
      // @ts-ignore-next-line -- Fix types incompatibility error. Related to BigNumber?
      () => {
        return trading.sor.pools.value;
      }
    );
    const error = computed(() => {
      if (trading.isBalancerTrade.value && !trading.isLoading.value) {
        if (errorMessage.value === TradeValidation.NO_LIQUIDITY) {
          return {
            header: t('insufficientLiquidity'),
            body: t('insufficientLiquidityDetailed'),
          };
        }
      }
      if (trading.isGnosisTrade.value) {
        if (trading.gnosis.validationError.value != null) {
          const validationError = trading.gnosis.validationError.value;
          if (validationError === ApiErrorCodes.SellAmountDoesNotCoverFee) {
            return {
              header: t('gnosisErrors.lowAmount.header'),
              body: t('gnosisErrors.lowAmount.body'),
            };
          } else if (validationError === ApiErrorCodes.PriceExceedsBalance) {
            return {
              header: t('gnosisErrors.lowBalance.header', [
                trading.tokenIn.value.symbol,
              ]),
              body: t('gnosisErrors.lowBalance.body', [
                trading.tokenIn.value.symbol,
                fNum2(
                  formatUnits(
                    trading.getQuote().maximumInAmount,
                    trading.tokenIn.value.decimals
                  ),
                  FNumFormats.token
                ),
                fNum2(trading.slippageBufferRate.value, FNumFormats.percent),
              ]),
            };
          } else if (validationError === ApiErrorCodes.NoLiquidity) {
            return {
              header: t('gnosisErrors.noLiquidity.header', [
                trading.tokenIn.value.symbol,
              ]),
              body: t('gnosisErrors.noLiquidity.body'),
            };
          } else {
            return {
              header: t('gnosisErrors.genericError.header'),
              body: trading.gnosis.validationError.value,
            };
          }
        }
      } else if (trading.isBalancerTrade.value) {
        if (isHighPriceImpact.value) {
          return {
            header: t('highPriceImpact'),
            body: t('highPriceImpactDetailed'),
            label: t('accept'),
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
            body: t('gnosisWarnings.highFees.body'),
          };
        }
      }
      return undefined;
    });

    // METHODS
    function trade() {
      trading.trade(() => {
        trading.resetAmounts();
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
      setTokenInAddress(assetIn || store.state.trade.inputAsset);
      setTokenOutAddress(assetOut || store.state.trade.outputAsset);

      let assetInAmount = router.currentRoute.value.query?.inAmount as string;
      let assetOutAmount = router.currentRoute.value.query?.outAmount as string;
      if (assetInAmount) {
        setTokenInAmount(assetInAmount);
      }
      if (!assetInAmount && assetOutAmount) {
        setTokenOutAmount(assetOutAmount);
      }
    }
    function switchToWETH() {
      tokenInAddress.value = appNetworkConfig.addresses.weth;
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
    onBeforeMount(() => {
      populateInitialTokens();
      setInitialized(true);
    });
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
      alwaysShowRoutes,
      exactIn,
      trading,
      // computed
      pools,
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
      handleErrorButtonClick,
    };
  },
});
</script>
<style scoped>
/* This is needed because the trade settings popover overflows */
.card-container {
  overflow: unset;
}

.trade-gasless :deep(.bal-toggle) {
  width: 3rem;
}

.gas-symbol {
  @apply h-8 w-8 rounded-full flex items-center justify-center text-lg bg-gray-50 dark:bg-gray-800;
}

.gas-symbol::before {
  content: '⛽';
}

.signature-symbol::before {
  content: '✍️';
}
</style>
