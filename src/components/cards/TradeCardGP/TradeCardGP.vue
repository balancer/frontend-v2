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
      <!-- <BalBtn
        v-if="poolsLoading"
        :loading="true"
        :loading-label="$t('loading')"
        block
      /> -->
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
      @close="tradeSuccess = false"
    />
  </BalCard>
  <!-- <teleport to="#modal">
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
  </teleport> -->
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

// import TradePreviewModal from '@/components/modals/TradePreviewModal.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import { useI18n } from 'vue-i18n';

import TradePairGP from './TradePairGP.vue';
import { formatUnits } from '@ethersproject/units';

export default defineComponent({
  components: {
    SuccessOverlay,
    TradePairGP,
    // TradePreviewModal,
    TradeSettingsPopover
  },

  setup() {
    const highPiAccepted = ref(false);
    const priceImpact = ref(0);
    const isSell = ref(true);
    const store = useStore();
    const router = useRouter();

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

    const isHighPriceImpact = computed(() => {
      return priceImpact.value >= 0.05 && !highPiAccepted.value;
    });
    const tokenInDecimals = computed(
      () => tokens.value[tokenInAddress.value]?.decimals ?? 18
    );
    const tokenOutDecimals = computed(
      () => tokens.value[tokenOutAddress.value]?.decimals ?? 18
    );

    const tradeDisabled = computed(() => {
      if (errorMessage.value !== TradeValidation.VALID) return true;
      if (isHighPriceImpact.value) return true;
      return false;
    });

    // COMPOSABLES
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

    const kind = computed(() => (isSell.value ? 'sell' : 'buy'));

    const error = computed(() => {
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

    async function handleAmountChange() {
      const tokenAmount = isSell.value ? tokenInAmount : tokenOutAmount;
      const otherTokenAmount = isSell.value ? tokenOutAmount : tokenInAmount;

      const params = {
        sellToken: tokenInAddress.value,
        buyToken: tokenOutAddress.value,
        amount: tokenAmount.value,
        kind: kind.value
      };
      // TODO: implement fee deduction
      const fee = await gnosisOperator.getFeeQuote(params);

      if (parseFloat(tokenAmount.value) > 0) {
        const priceQuote = await gnosisOperator.getPriceQuote(params);

        if (priceQuote != null) {
          otherTokenAmount.value = formatUnits(
            priceQuote.amount,
            isSell.value ? tokenInDecimals.value : tokenOutDecimals.value
          );
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
      handleAmountChange();
    });

    watch(tokenOutAmount, async () => {
      handleAmountChange();
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
      isSell
    };
  }
});
</script>
