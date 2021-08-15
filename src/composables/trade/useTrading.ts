import { computed, Ref, watch } from 'vue';
import { useStore } from 'vuex';
import { bnum, scale } from '@/lib/utils';
import useNumbers from '../useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import useSor from './useSor';
import useGnosis from './useGnosis';
import useTokens from '../useTokens';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWrapAction, WrapType } from '@/lib/utils/balancer/wrapper';

export type TradeRoute = 'wrapUnwrap' | 'balancer' | 'gnosis';

export type UseTrading = ReturnType<typeof useTrading>;

export default function useTrading(
  exactIn: Ref<boolean>,
  tokenInAddressInput: Ref<string>,
  tokenInAmountInput: Ref<string>,
  tokenOutAddressInput: Ref<string>,
  tokenOutAmountInput: Ref<string>
) {
  // COMPOSABLES
  const store = useStore();
  const { fNum } = useNumbers();
  const { tokens } = useTokens();
  const { blockNumber } = useWeb3();

  // COMPUTED
  const slippageBufferRate = computed(() =>
    parseFloat(store.state.app.slippage)
  );

  const liquiditySelection = computed(() => store.state.app.tradeLiquidity);

  const wrapType = computed(() =>
    getWrapAction(tokenInAddressInput.value, tokenOutAddressInput.value)
  );
  const isWrap = computed(() => wrapType.value === WrapType.Wrap);
  const isUnwrap = computed(() => wrapType.value === WrapType.Unwrap);

  const tokenIn = computed(() => tokens.value[tokenInAddressInput.value]);

  const tokenOut = computed(() => tokens.value[tokenOutAddressInput.value]);

  const isEthTrade = computed(
    () => tokenInAddressInput.value === NATIVE_ASSET_ADDRESS
  );

  const tokenInAmountScaled = computed(() =>
    scale(bnum(tokenInAmountInput.value), tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    scale(bnum(tokenOutAmountInput.value), tokenOut.value.decimals)
  );

  const requiresApproval = computed(() => {
    if (wrapType.value === WrapType.Unwrap || isEthTrade.value) {
      return false;
    }
    return true;
  });

  const effectivePriceMessage = computed(() => {
    const tokenInAmount = parseFloat(tokenInAmountInput.value);
    const tokenOutAmount = parseFloat(tokenOutAmountInput.value);

    if (tokenInAmount > 0 && tokenOutAmount > 0) {
      return {
        tokenIn: `1 ${tokenIn.value?.symbol} = ${fNum(
          bnum(tokenOutAmount)
            .div(tokenInAmount)
            .toString(),
          'token'
        )} ${tokenOut.value?.symbol}`,
        tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum(
          bnum(tokenInAmount)
            .div(tokenOutAmount)
            .toString(),
          'token'
        )} ${tokenIn.value?.symbol}`
      };
    }
    return {
      tokenIn: '',
      tokenOut: ''
    };
  });

  const tradeRoute = computed<TradeRoute>(() => {
    if (wrapType.value !== WrapType.NonWrap) {
      return 'wrapUnwrap';
    }

    return isEthTrade.value ? 'balancer' : 'gnosis';
  });

  const isGnosisTrade = computed(() => tradeRoute.value === 'gnosis');

  const isBalancerTrade = computed(() => tradeRoute.value === 'balancer');

  const isWrapUnwrapTrade = computed(() => tradeRoute.value === 'wrapUnwrap');

  const hasTradeQuote = computed(
    () =>
      parseFloat(tokenInAmountInput.value) > 0 &&
      parseFloat(tokenOutAmountInput.value) > 0
  );

  const sor = useSor({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokens,
    wrapType,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    sorConfig: {
      handleAmountsOnFetchPools: false,
      refetchPools: false
    },
    tokenIn,
    tokenOut,
    slippageBufferRate
  });

  const gnosis = useGnosis({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokenIn,
    tokenOut,
    slippageBufferRate
  });

  const isLoading = computed(() => {
    if (hasTradeQuote.value || isWrapUnwrapTrade.value) {
      return false;
    }

    return isBalancerTrade.value
      ? sor.poolsLoading.value
      : gnosis.updatingQuotes.value;
  });

  const isConfirming = computed(
    () => sor.confirming.value || gnosis.confirming.value
  );

  // METHODS
  function trade(successCallback?: () => void) {
    if (isGnosisTrade.value) {
      return gnosis.trade(() => {
        if (successCallback) {
          successCallback();
        }

        gnosis.resetState();
      });
    } else {
      // handles both Balancer and Wrap/Unwrap trades
      return sor.trade(() => {
        if (successCallback) {
          successCallback();
        }

        sor.resetState();
      });
    }
  }

  function getQuote() {
    if (isGnosisTrade.value) {
      return gnosis.getQuote();
    } else {
      return sor.getQuote();
    }
  }

  function handleAmountChange() {
    if (exactIn.value) {
      tokenOutAmountInput.value = '';
    } else {
      tokenInAmountInput.value = '';
    }

    if (isGnosisTrade.value) {
      gnosis.resetState(false);
      gnosis.handleAmountChange();
    } else {
      sor.resetState();
      sor.handleAmountChange();
    }
  }

  // WATCHERS
  watch(tokenInAddressInput, async () => {
    store.commit('trade/setInputAsset', tokenInAddressInput.value);

    handleAmountChange();
  });

  watch(tokenOutAddressInput, () => {
    store.commit('trade/setOutputAsset', tokenOutAddressInput.value);

    handleAmountChange();
  });

  watch(blockNumber, () => {
    if (isGnosisTrade.value) {
      if (!gnosis.hasErrors.value) {
        gnosis.handleAmountChange();
      }
    } else if (isBalancerTrade.value) {
      sor.fetchPools();
    }
  });

  watch(slippageBufferRate, () => {
    handleAmountChange();
  });

  watch(liquiditySelection, () => {
    if (isBalancerTrade.value) {
      handleAmountChange();
    }
  });

  return {
    // computed
    isWrap,
    isUnwrap,
    isEthTrade,
    tokenIn,
    tokenOut,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokens,
    requiresApproval,
    effectivePriceMessage,
    tradeRoute,
    exactIn,
    isLoading,
    gnosis,
    sor,
    isGnosisTrade,
    isBalancerTrade,
    wrapType,
    isWrapUnwrapTrade,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    slippageBufferRate,
    isConfirming,

    // methods
    getQuote,
    trade,
    handleAmountChange
  };
}
