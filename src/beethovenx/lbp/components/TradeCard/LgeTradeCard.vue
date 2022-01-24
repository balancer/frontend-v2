<template>
  <BalCard class="relative" :shadow="tradeCardShadow" :no-border="!darkMode">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">
          {{ title }}
        </h4>
        <TradeSettingsPopover :context="TradeSettingsContext.trade" />
      </div>
    </template>
    <div class="mb-2">
      <LbpTradePair
        v-model:tokenInAmount="tokenInAmount"
        v-model:tokenInAddress="tokenInAddress"
        v-model:tokenOutAmount="tokenOutAmount"
        v-model:tokenOutAddress="tokenOutAddress"
        v-model:exactIn="exactIn"
        :priceImpact="priceImpact"
        @amountChange="handleAmountChange"
        class="mb-4"
        :lge="lge"
      />
      <BalAlert
        v-if="error && !(poolsLoading || isLoadingApprovals)"
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
        v-if="poolsLoading || isLoadingApprovals"
        :loading="true"
        :loading-label="$t('loading')"
        block
      />
      <BalBtn
        v-else
        :label="'Preview trade'"
        :disabled="tradeDisabled"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="showTradePreviewModal"
      />
      <!--      <TradeRoute
        class="mt-5"
        :address-in="tokenInAddress"
        :amount-in="tokenInAmount"
        :address-out="tokenOutAddress"
        :amount-out="tokenOutAmount"
        :pools="pools"
        :sor-return="sorReturn"
      />-->
    </div>
    <SuccessOverlay
      v-if="tradeSuccess"
      :title="$t('tradeSettled')"
      :description="$t('tradeSuccess')"
      :closeLabel="$t('close')"
      :explorer-link="explorer.txLink(txHash)"
      @close="tradeSuccess = false"
    />
  </BalCard>
  <teleport to="#modal">
    <TradePreviewModal
      v-if="modalTradePreviewIsOpen"
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
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getAddress, isAddress } from '@ethersproject/address';

import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation, {
  TradeValidation
} from '@/composables/trade/useValidation';
import useSor from '@/composables/trade/useSor';

import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import TradePreviewModal from '@/components/modals/TradePreviewModal.vue';
import TradeRoute from '@/components/cards/TradeCard/TradeRoute.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokens from '@/composables/useTokens';
import useDarkMode from '@/composables/useDarkMode';
import { configService } from '@/services/config/config.service';

import { getWrapAction } from '@/lib/utils/balancer/wrapper';
import { useTradeState } from '@/composables/trade/useTradeState';
import useUserSettings from '@/composables/useUserSettings';
import useLge from '@/beethovenx/lbp/composables/useLge';
import LbpTradePair from '@/beethovenx/lbp/components/TradeCard/LgeTradePair.vue';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  props: {
    lge: {
      type: Object as PropType<GqlLge>,
      required: true
    },
    pool: {
      type: Object as PropType<FullPool>,
      required: true
    },
    swapEnabled: {
      type: Boolean
    }
  },

  components: {
    LbpTradePair,
    SuccessOverlay,
    TradePreviewModal,
    TradeSettingsPopover
  },

  setup(props) {
    const { launchToken, onNewTx } = useLge(props.lge, props.pool);
    const highPiAccepted = ref(false);
    const store = useStore();
    const router = useRouter();
    const { explorerLinks, isMismatchedNetwork } = useWeb3();
    const { t } = useI18n();
    const { bp } = useBreakpoints();

    const { tokens, nativeAsset } = useTokens();
    const { userNetworkConfig } = useWeb3();
    const { darkMode } = useDarkMode();
    const {
      tokenInAddress,
      tokenOutAddress,
      tokenInAmount,
      tokenOutAmount,
      setTokenInAddress,
      setTokenOutAddress
    } = useTradeState();
    const { slippage } = useUserSettings();

    const exactIn = ref(true);

    const tradeSuccess = ref(false);
    const txHash = ref('');
    const modalTradePreviewIsOpen = ref(false);

    const slippageBufferRate = computed(() => parseFloat(slippage.value));

    const tokenIn = computed(() => tokens.value[tokenInAddress.value]);

    const tokenOut = computed(() => tokens.value[tokenOutAddress.value]);

    const liquiditySelection = computed(() => store.state.app.tradeLiquidity);

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

    const wrapType = computed(() =>
      getWrapAction(tokenInAddress.value, tokenOutAddress.value)
    );

    const isHighPriceImpact = computed(() => {
      return priceImpact.value >= 0.05 && !highPiAccepted.value;
    });

    const tradeDisabled = computed(() => {
      if (isMismatchedNetwork.value) return true;
      if (errorMessage.value !== TradeValidation.VALID) return true;
      if (isHighPriceImpact.value) return true;
      return false;
    });

    // COMPOSABLES
    const { isLoading: isLoadingApprovals } = useTokenApproval(
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
      sorReturn,
      latestTxHash,
      pools,
      fetchPools,
      poolsLoading,
      sorManagerRef,
      sorManagerInitialized
    } = useSor({
      exactIn,
      tokenInAddressInput: tokenInAddress,
      tokenInAmountInput: tokenInAmount,
      tokenOutAddressInput: tokenOutAddress,
      tokenOutAmountInput: tokenOutAmount,
      tokens,
      wrapType,
      tokenIn,
      tokenOut,
      slippageBufferRate
    });
    const { errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );

    const title = computed(() => {
      const prefix =
        launchToken.value?.address === tokenOutAddress.value ? 'Buy' : 'Sell';

      return `${prefix} ${launchToken.value?.symbol}`;
    });

    const error = computed(() => {
      if (props.swapEnabled === false) {
        return {
          header: 'Swapping disabled',
          body: 'Swapping is disabled for this event.'
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
      let assetIn = props.lge.collateralTokenAddress;

      if (assetIn === nativeAsset.deeplinkId) {
        assetIn = nativeAsset.address;
      } else if (isAddress(assetIn)) {
        assetIn = getAddress(assetIn);
      }

      let assetOut = props.lge.tokenContractAddress;

      if (assetOut === nativeAsset.deeplinkId) {
        assetOut = nativeAsset.address;
      } else if (isAddress(assetOut)) {
        assetOut = getAddress(assetOut);
      }

      setTokenInAddress(assetIn || store.state.trade.inputAsset);
      setTokenOutAddress(assetOut || store.state.trade.outputAsset);
    }

    function showTradePreviewModal() {
      modalTradePreviewIsOpen.value = true;
    }

    watch(userNetworkConfig, async () => {
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

    watch(liquiditySelection, () => {
      // When the liquidity type is changed we need to update the trade to use that selection
      handleAmountChange();
    });

    watch(latestTxHash, () => {
      // Refresh SOR pools
      fetchPools();
      txHash.value = latestTxHash.value;
      tradeSuccess.value = true;
      modalTradePreviewIsOpen.value = false;
      onNewTx();
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
      poolsLoading,
      showTradePreviewModal,
      isLoadingApprovals,
      bp,
      darkMode,
      tradeCardShadow,
      explorer: explorerLinks,
      sorManagerRef,
      sorManagerInitialized
    };
  }
});
</script>
