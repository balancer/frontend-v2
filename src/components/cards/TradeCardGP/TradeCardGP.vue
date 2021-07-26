<template>
  <BalCard class="relative" :shadow="tradeCardShadow" no-border>
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
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="modalTradePreviewIsOpen = true"
      />
      <div
        class="mt-6 bg-gray-50 rounded text-sm p-3 grid gap-2 grid-flow-col text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        v-if="trading.isBalancerTrade.value && !trading.isWrapOrUnwrap.value"
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
import useBreakpoints from '@/composables/useBreakpoints';

import { ETHER } from '@/constants/tokenlists';
import { TOKENS } from '@/constants/tokens';

import { isRequired } from '@/lib/utils/validations';

import TradePreviewModalGP from '@/components/modals/TradePreviewModalGP.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

import { configService } from '@/services/config/config.service';

import TradePairGP from './TradePairGP.vue';

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

    // DATA
    const exactIn = ref(true);
    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const modalTradePreviewIsOpen = ref(false);

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
      tokenOutAmount,
      trading.tokens
    );

    const tradeDisabled = computed(
      () =>
        errorMessage.value !== TradeValidation.VALID ||
        (trading.isGnosisTrade.value && trading.gnosis.hasErrors.value)
    );

    useTokenApprovalGP(tokenInAddress, tokenInAmount);

    const title = computed(() => {
      if (trading.isWrap.value) {
        return `${t('wrap')} ${ETHER.symbol}`;
      }
      if (trading.isUnwrap.value) {
        return `${t('unwrap')} ${ETHER.symbol}`;
      }
      return t('trade');
    });

    const error = computed(() => {
      if (trading.gnosis.errors.value.feeExceedsPrice) {
        return {
          header: 'Low amount',
          body: 'Fees exceeds from amount'
        };
      }
      switch (errorMessage.value) {
        case TradeValidation.NO_NATIVE_ASSET:
          return {
            header: t('noNativeAsset', [nativeAsset.symbol]),
            body: t('noNativeAssetDetailed', [
              nativeAsset.symbol,
              configService.network.chainName
            ])
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

    function trade() {
      trading.trade(() => {
        modalTradePreviewIsOpen.value = false;
      });
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

    function switchToWETH() {
      tokenInAddress.value = TOKENS.AddressMap.WETH;
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
      errorMessage,
      isRequired,
      tradeDisabled,
      tradeCardShadow,

      // methods
      handleErrorButtonClick,
      trade,
      switchToWETH
    };
  }
});
</script>
