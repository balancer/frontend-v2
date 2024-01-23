<template>
  <BalCard class="relative card-container" :shadow="swapCardShadow" noBorder>
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h4>{{ title }}</h4>
        <SwapSettingsPopover
          :context="SwapSettingsContext.swap"
          :isGasless="swapping.swapGasless.value"
        />
      </div>
    </template>
    <div>
      <SwapPair
        v-model:tokenInAmount="tokenInAmount"
        v-model:tokenInAddress="tokenInAddress"
        v-model:tokenOutAmount="tokenOutAmount"
        v-model:tokenOutAddress="tokenOutAddress"
        v-model:exactIn="exactIn"
        :swapLoading="
          swapping.isBalancerSwap.value ? swapping.isLoading.value : false
        "
        :effectivePriceMessage="swapping.effectivePriceMessage"
        class="mb-4"
        @amount-change="swapping.handleAmountChange"
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
        v-if="swapping.isLoading.value"
        loading
        disabled
        :loadingLabel="
          swapping.isCowswapSwap.value ? $t('loadingBestPrice') : $t('loading')
        "
        block
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        :disabled="swapDisabled"
        color="gradient"
        block
        @click.prevent="handlePreviewButton"
      />
      <SwapRoute
        v-if="alwaysShowRoutes"
        :addressIn="swapping.tokenIn.value.address"
        :amountIn="swapping.tokenInAmountInput.value"
        :addressOut="swapping.tokenOut.value.address"
        :amountOut="swapping.tokenOutAmountInput.value"
        :pools="pools"
        :sorReturn="swapping.sor.sorReturn.value"
        class="mt-4"
      />
    </div>
  </BalCard>
  <teleport to="#modal">
    <SwapPreviewModal
      v-if="modalSwapPreviewIsOpen"
      :swapping="swapping"
      :error="error"
      :warning="warning"
      @close="handlePreviewModalClose"
    />
  </teleport>
</template>

<script lang="ts">
import { SubgraphPoolBase } from '@balancer-labs/sdk';
import { getAddress, isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSwapAssets } from '@/composables/swap/useSwapAssets';
import SwapPreviewModal from '@/components/modals/SwapPreviewModal.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { useSwapState } from '@/composables/swap/useSwapState';
import useSwapping from '@/composables/swap/useSwapping';
import useValidation from '@/composables/swap/useValidation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { TOKENS } from '@/constants/tokens';
import { lsGet } from '@/lib/utils';
import { WrapType } from '@/lib/utils/balancer/wrapper';
import { isRequired } from '@/lib/utils/validations';
import { ApiErrorCodes } from '@/services/cowswap/errors/OperatorError';
import useWeb3 from '@/services/web3/useWeb3';
import SwapPair from './SwapPair.vue';
import SwapRoute from './SwapRoute.vue';

export default defineComponent({
  components: {
    SwapPair,
    SwapPreviewModal,
    SwapRoute,
    SwapSettingsPopover,
  },
  setup() {
    // COMPOSABLES
    const { inputAsset, outputAsset } = useSwapAssets();
    const router = useRouter();
    const { t } = useI18n();
    const { bp } = useBreakpoints();
    const { fNum } = useNumbers();
    const { appNetworkConfig, isMismatchedNetwork } = useWeb3();
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
    } = useSwapState();
    // DATA
    const exactIn = ref(true);
    const modalSwapPreviewIsOpen = ref(false);
    const dismissedErrors = ref({
      highPriceImpact: false,
    });
    const alwaysShowRoutes = lsGet('alwaysShowRoutes', false);
    const swapCardShadow = computed(() => {
      switch (bp.value) {
        case 'xs':
          return 'none';
        case 'sm':
          return 'lg';
        default:
          return 'xl';
      }
    });
    const swapping = useSwapping(
      exactIn,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );
    const { errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );
    // COMPUTED
    const isHighPriceImpact = computed(
      () =>
        swapping.sor.validationErrors.value.highPriceImpact &&
        !dismissedErrors.value.highPriceImpact
    );
    const swapDisabled = computed(() => {
      const hasMismatchedNetwork = isMismatchedNetwork.value;
      const hasAmountsError = !tokenInAmount.value || !tokenOutAmount.value;
      const hasCowswapErrors =
        swapping.isCowswapSwap.value &&
        swapping.cowswap.hasValidationError.value;
      const hasBalancerErrors =
        swapping.isBalancerSwap.value && isHighPriceImpact.value;
      return (
        hasAmountsError ||
        hasCowswapErrors ||
        hasBalancerErrors ||
        hasMismatchedNetwork
      );
    });
    const title = computed(() => {
      if (swapping.wrapType.value === WrapType.Wrap) {
        return `${t('wrap')} ${swapping.tokenIn.value?.symbol}`;
      }
      if (swapping.wrapType.value === WrapType.Unwrap) {
        return `${t('unwrap')} ${swapping.tokenOut.value?.symbol}`;
      }
      return t('swap');
    });
    const pools = computed<SubgraphPoolBase[]>(
      // @ts-ignore-next-line -- Fix types incompatibility error. Related to BigNumber?
      () => {
        return swapping.sor.pools.value;
      }
    );
    const error = computed(() => {
      if (isMismatchedNetwork.value) {
        return {
          header: t('switchNetwork'),
          body: t('networkMismatch', [appNetworkConfig.name]),
        };
      }
      if (swapping.isBalancerSwap.value && !swapping.isLoading.value) {
        if (swapping.sor.validationErrors.value.noSwaps) {
          return {
            header: t('insufficientLiquidity'),
            body: t('insufficientLiquidityDetailed'),
          };
        }
      }
      if (swapping.isCowswapSwap.value) {
        if (swapping.cowswap.validationError.value != null) {
          const validationError = swapping.cowswap.validationError.value;
          if (validationError === ApiErrorCodes.SellAmountDoesNotCoverFee) {
            return {
              header: t('cowswapErrors.lowAmount.header'),
              body: t('cowswapErrors.lowAmount.body'),
            };
          } else if (validationError === ApiErrorCodes.PriceExceedsBalance) {
            return {
              header: t('cowswapErrors.lowBalance.header', [
                swapping.tokenIn.value.symbol,
              ]),
              body: t('cowswapErrors.lowBalance.body', [
                swapping.tokenIn.value.symbol,
                fNum(
                  formatUnits(
                    swapping.getQuote().maximumInAmount,
                    swapping.tokenIn.value.decimals
                  ),
                  FNumFormats.token
                ),
                fNum(swapping.slippageBufferRate.value, FNumFormats.percent),
              ]),
            };
          } else if (validationError === ApiErrorCodes.NoLiquidity) {
            return {
              header: t('cowswapErrors.noLiquidity.header', [
                swapping.tokenIn.value.symbol,
              ]),
              body: t('cowswapErrors.noLiquidity.body'),
            };
          } else {
            return {
              header: t('cowswapErrors.genericError.header'),
              body: swapping.cowswap.validationError.value,
            };
          }
        }
      } else if (swapping.isBalancerSwap.value) {
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
      if (swapping.isCowswapSwap.value) {
        if (swapping.cowswap.warnings.value.highFees) {
          return {
            header: t('cowswapWarnings.highFees.header'),
            body: t('cowswapWarnings.highFees.body'),
          };
        }
      }
      return undefined;
    });

    // METHODS

    function handleErrorButtonClick() {
      if (swapping.sor.validationErrors.value.highPriceImpact) {
        dismissedErrors.value.highPriceImpact = true;
      }
    }

    function isNativeAssetIdentifier(assetParam: string | undefined): boolean {
      return (
        assetParam?.toLowerCase() === nativeAsset.deeplinkId?.toLowerCase() ||
        assetParam?.toLowerCase() === nativeAsset.symbol?.toLowerCase()
      );
    }

    function getFirstValidAddress(assets: string[]): string | undefined {
      for (const asset of assets) {
        if (isNativeAssetIdentifier(asset)) {
          return nativeAsset.address;
        }
        if (isAddress(asset)) {
          return getAddress(asset);
        }
      }
    }

    function populateInitialTokens(): void {
      const assetIn = getFirstValidAddress([
        router.currentRoute.value.params.assetIn,
        inputAsset.value,
        appNetworkConfig.tokens.InitialSwapTokens.input,
      ]);
      if (assetIn) {
        setTokenInAddress(assetIn);
      }
      const assetOut = getFirstValidAddress([
        router.currentRoute.value.params.assetOut,
        outputAsset.value,
        appNetworkConfig.tokens.InitialSwapTokens.output,
      ]);
      if (assetOut) {
        setTokenOutAddress(assetOut);
      }

      let assetInAmount = router.currentRoute.value.query?.inAmount as string;
      let assetOutAmount = router.currentRoute.value.query?.outAmount as string;
      if (assetInAmount) {
        setTokenInAmount(assetInAmount);
      }
      if (!assetInAmount && assetOutAmount) {
        setTokenOutAmount(assetOutAmount);
      }
    }
    function handlePreviewButton() {
      swapping.resetSubmissionError();
      modalSwapPreviewIsOpen.value = true;
    }
    function handlePreviewModalClose() {
      swapping.resetSubmissionError();
      modalSwapPreviewIsOpen.value = false;
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
      SwapSettingsContext,
      // data
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      modalSwapPreviewIsOpen,
      alwaysShowRoutes,
      exactIn,
      swapping,
      // computed
      pools,
      title,
      error,
      warning,
      errorMessage,
      isRequired,
      swapDisabled,
      swapCardShadow,
      handlePreviewButton,
      handlePreviewModalClose,
      // methods
      handleErrorButtonClick,
    };
  },
});
</script>
<style scoped>
/* This is needed because the swap settings popover overflows */
.card-container {
  overflow: unset;
}

.swap-gasless :deep(.bal-toggle) {
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
