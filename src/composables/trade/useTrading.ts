import { computed, Ref, watch } from 'vue';
import { useStore } from 'vuex';

import { ETHER } from '@/constants/tokenlists';

import { bnum, scale } from '@/lib/utils';

import useNumbers from '../useNumbers';
import useTokens from '../useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import useSor from './useSor';
import useGnosis from './useGnosis';

export type TradeRoute = 'balancer' | 'gnosis';

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
  const { blockNumber, userNetworkConfig } = useWeb3();

  // COMPUTED
  const isWrap = computed(
    () =>
      tokenInAddressInput.value === ETHER.address &&
      tokenOutAddressInput.value === userNetworkConfig.value.addresses.weth
  );

  const isUnwrap = computed(
    () =>
      tokenOutAddressInput.value === ETHER.address &&
      tokenInAddressInput.value === userNetworkConfig.value.addresses.weth
  );

  const tokenIn = computed(() => tokens.value[tokenInAddressInput.value]);

  const tokenOut = computed(() => tokens.value[tokenOutAddressInput.value]);

  const isEthTrade = computed(
    () => tokenInAddressInput.value === ETHER.address
  );

  const tokenInAmountScaled = computed(() =>
    scale(bnum(tokenInAmountInput.value), tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    scale(bnum(tokenOutAmountInput.value), tokenOut.value.decimals)
  );

  const requiresApproval = computed(() => {
    if (isWrap.value || isUnwrap.value || isEthTrade.value) {
      return false;
    }
    return true;
  });

  const effectivePriceMessage = computed(() => {
    if (tokenInAmountScaled.value.gt(0) && tokenOutAmountScaled.value.gt(0)) {
      return {
        tokenIn: `1 ${tokenIn.value?.symbol} = ${fNum(
          tokenOutAmountScaled.value.div(tokenInAmountScaled.value).toString(),
          'token'
        )} ${tokenOut.value?.symbol}`,
        tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum(
          tokenInAmountScaled.value.div(tokenOutAmountScaled.value).toString(),
          'token'
        )} ${tokenIn.value?.symbol}`
      };
    }
    return {
      tokenIn: '',
      tokenOut: ''
    };
  });

  const isWrapOrUnwrap = computed(() => isWrap.value || isUnwrap.value);

  const tradeRoute = computed<TradeRoute>(() => {
    return isWrapOrUnwrap.value || isEthTrade.value ? 'balancer' : 'gnosis';
  });

  const isGnosisTrade = computed(() => tradeRoute.value === 'gnosis');
  const isBalancerTrade = computed(() => tradeRoute.value === 'balancer');

  const sor = useSor({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokens,
    isWrap,
    isUnwrap,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    sorConfig: {
      handleAmountsOnFetchPools: false,
      refetchPools: isBalancerTrade.value,
      enableTxHandler: isBalancerTrade.value
    },
    tokenIn,
    tokenOut
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
    tokenOut
  });

  // initial loading
  const isLoading = computed(() =>
    isBalancerTrade.value ? sor.poolsLoading.value : gnosis.updatingQuotes.value
  );

  // METHODS
  function trade(successCallback?: () => void) {
    if (isGnosisTrade.value) {
      return gnosis.trade(successCallback);
    } else {
      return sor.trade(successCallback);
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
    if (isGnosisTrade.value) {
      gnosis.handleAmountChange();
    } else {
      sor.handleAmountChange();
    }
  }

  function handleAssetChange() {
    if (isGnosisTrade.value) {
      gnosis.resetErrors();
      gnosis.resetFees();
    }
  }

  // WATCHERS
  watch(tokenInAddressInput, async () => {
    store.commit('trade/setInputAsset', tokenInAddressInput.value);

    handleAssetChange();
    handleAmountChange();
  });

  watch(tokenOutAddressInput, () => {
    store.commit('trade/setOutputAsset', tokenOutAddressInput.value);

    handleAssetChange();
    handleAmountChange();
  });

  watch(blockNumber, () => {
    if (isGnosisTrade.value && !gnosis.hasErrors.value) {
      gnosis.handleAmountChange();
    }
  });

  return {
    // computed
    isWrap,
    isUnwrap,
    isEthTrade,
    isWrapOrUnwrap,
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
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    // methods
    getQuote,
    trade,
    handleAmountChange
  };
}
