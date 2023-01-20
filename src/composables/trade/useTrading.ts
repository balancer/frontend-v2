import { parseFixed } from '@ethersproject/bignumber';
import { computed, onMounted, Ref, ref, watch } from 'vue';
import { useStore } from 'vuex';

import LS_KEYS from '@/constants/local-storage.keys';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { bnum, lsSet } from '@/lib/utils';
import { getWrapAction, WrapType } from '@/lib/utils/balancer/wrapper';
import { COW_SUPPORTED_NETWORKS } from '@/services/cowswap/constants';
import {
  canUseJoinExit,
  someJoinExit,
  SubgraphPoolBase,
  SwapTypes,
} from '@balancer-labs/sdk';

import useWeb3 from '@/services/web3/useWeb3';
import { networkId } from '../useNetwork';
import useNumbers, { FNumFormats } from '../useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { useUserSettings } from '@/providers/user-settings.provider';
import useCowswap from './useCowswap';
import useSor from './useSor';
import useJoinExit from './useJoinExit';

export type TradeRoute = 'wrapUnwrap' | 'balancer' | 'cowswap' | 'joinExit';

export type UseTrading = ReturnType<typeof useTrading>;

export const tradeGasless = ref<boolean>(false);

export default function useTrading(
  exactIn: Ref<boolean>,
  tokenInAddressInput: Ref<string>,
  tokenInAmountInput: Ref<string>,
  tokenOutAddressInput: Ref<string>,
  tokenOutAmountInput: Ref<string>
) {
  // COMPOSABLES
  const store = useStore();
  const { fNum2 } = useNumbers();
  const { getToken, tokens } = useTokens();
  const { blockNumber } = useWeb3();
  const { slippage } = useUserSettings();

  // COMPUTED
  const slippageBufferRate = computed(() => parseFloat(slippage.value));

  const wrapType = computed(() =>
    getWrapAction(tokenInAddressInput.value, tokenOutAddressInput.value)
  );
  const isWrap = computed(() => wrapType.value === WrapType.Wrap);
  const isUnwrap = computed(() => wrapType.value === WrapType.Unwrap);

  const tokenIn = computed(() => getToken(tokenInAddressInput.value));

  const tokenOut = computed(() => getToken(tokenOutAddressInput.value));

  const isEthTrade = computed(
    () => tokenInAddressInput.value === NATIVE_ASSET_ADDRESS
  );

  const tokenInAmountScaled = computed(() =>
    parseFixed(tokenInAmountInput.value || '0', tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    parseFixed(tokenOutAmountInput.value || '0', tokenOut.value.decimals)
  );

  const requiresTokenApproval = computed(() => {
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
        tokenIn: `1 ${tokenIn.value?.symbol} = ${fNum2(
          bnum(tokenOutAmount).div(tokenInAmount).toString(),
          FNumFormats.token
        )} ${tokenOut.value?.symbol}`,
        tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum2(
          bnum(tokenInAmount).div(tokenOutAmount).toString(),
          FNumFormats.token
        )} ${tokenIn.value?.symbol}`,
      };
    }
    return {
      tokenIn: '',
      tokenOut: '',
    };
  });

  const isCowswapSupportedOnNetwork = computed(() =>
    COW_SUPPORTED_NETWORKS.includes(networkId.value)
  );

  const tradeRoute = computed<TradeRoute>(() => {
    if (wrapType.value !== WrapType.NonWrap) {
      return 'wrapUnwrap';
    } else if (isEthTrade.value) {
      return 'balancer';
    }

    if (tradeGasless.value && isCowswapSupportedOnNetwork.value) {
      return 'cowswap';
    } else {
      const swapInfoAvailable =
        joinExit.swapInfo.value?.returnAmount &&
        !joinExit.swapInfo.value?.returnAmount.isZero();

      const joinExitSwapAvailable = swapInfoAvailable
        ? canUseJoinExit(
            exactIn.value ? SwapTypes.SwapExactIn : SwapTypes.SwapExactOut,
            tokenInAddressInput.value,
            tokenOutAddressInput.value
          )
        : false;

      const joinExitSwapPresent = joinExitSwapAvailable
        ? someJoinExit(
            sor.pools.value as SubgraphPoolBase[],
            joinExit.swapInfo.value?.swaps ?? [],
            joinExit.swapInfo.value?.tokenAddresses ?? []
          )
        : false;
      // Currently joinExit trade is only suitable for ExactIn and non-eth swaps
      return joinExitSwapPresent ? 'joinExit' : 'balancer';
    }
  });

  const isCowswapTrade = computed(() => tradeRoute.value === 'cowswap');

  const isBalancerTrade = computed(() => tradeRoute.value === 'balancer');

  const isJoinExitTrade = computed(() => tradeRoute.value === 'joinExit');

  const isWrapUnwrapTrade = computed(() => tradeRoute.value === 'wrapUnwrap');

  const isGaslessTradingDisabled = computed(
    () => isEthTrade.value || isWrapUnwrapTrade.value
  );

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
    wrapType,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    sorConfig: {
      handleAmountsOnFetchPools: true,
    },
    tokenIn,
    tokenOut,
    slippageBufferRate,
  });

  const cowswap = useCowswap({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokenIn,
    tokenOut,
    slippageBufferRate,
  });

  const joinExit = useJoinExit({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokenIn,
    tokenOut,
    slippageBufferRate,
    pools: sor.pools as Ref<SubgraphPoolBase[]>,
  });

  const isLoading = computed(() => {
    if (hasTradeQuote.value || isWrapUnwrapTrade.value) {
      return false;
    }

    if (isCowswapTrade.value) {
      return cowswap.updatingQuotes.value;
    }

    return joinExit.swapInfoLoading.value || sor.poolsLoading.value;
  });

  const isConfirming = computed(
    () =>
      sor.confirming.value ||
      cowswap.confirming.value ||
      joinExit.confirming.value
  );

  const submissionError = computed(
    () =>
      sor.submissionError.value ||
      cowswap.submissionError.value ||
      joinExit.submissionError.value
  );

  // METHODS
  function trade(successCallback?: () => void) {
    if (isCowswapTrade.value) {
      return cowswap.trade(() => {
        if (successCallback) {
          successCallback();
        }

        cowswap.resetState();
      });
    } else if (isJoinExitTrade.value) {
      return joinExit.trade(() => {
        if (successCallback) {
          successCallback();
        }

        joinExit.resetState();
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

  function resetSubmissionError() {
    sor.submissionError.value = null;
    cowswap.submissionError.value = null;
    joinExit.submissionError.value = null;
  }

  function setTradeGasless(flag: boolean) {
    tradeGasless.value = flag;

    lsSet(LS_KEYS.Trade.Gasless, tradeGasless.value);
  }

  function toggleTradeGasless() {
    setTradeGasless(!tradeGasless.value);

    handleAmountChange();
  }

  function getQuote() {
    if (isCowswapTrade.value) {
      return cowswap.getQuote();
    }
    if (isJoinExitTrade.value) {
      return joinExit.getQuote();
    }
    return sor.getQuote();
  }

  function resetAmounts() {
    sor.resetInputAmounts('');
  }

  function handleAmountChange() {
    if (exactIn.value) {
      tokenOutAmountInput.value = '';
    } else {
      tokenInAmountInput.value = '';
    }

    if (isCowswapTrade.value) {
      cowswap.resetState(false);
      cowswap.handleAmountChange();
    } else {
      if (!isJoinExitTrade.value) {
        sor.resetState();
        sor.handleAmountChange();
      }
      joinExit.resetState();
      joinExit.handleAmountChange();
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

  onMounted(() => {
    const gaslessDisabled = window.location.href.includes('gasless=false');

    if (gaslessDisabled) {
      setTradeGasless(false);
    }
  });

  watch(blockNumber, () => {
    if (isCowswapTrade.value) {
      if (!cowswap.hasValidationError.value) {
        cowswap.handleAmountChange();
      }
    } else if (isJoinExitTrade.value) {
      if (!joinExit.hasValidationError.value) {
        joinExit.handleAmountChange();
      }
    } else if (isBalancerTrade.value) {
      sor.updateTradeAmounts();
    }
  });

  watch(slippageBufferRate, () => {
    handleAmountChange();
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
    requiresTokenApproval,
    effectivePriceMessage,
    tradeRoute,
    exactIn,
    isLoading,
    cowswap,
    sor,
    joinExit,
    isCowswapTrade,
    isBalancerTrade,
    isJoinExitTrade,
    wrapType,
    isWrapUnwrapTrade,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    slippageBufferRate,
    isConfirming,
    submissionError,
    resetSubmissionError,
    tradeGasless,
    toggleTradeGasless,
    isGaslessTradingDisabled,
    isCowswapSupportedOnNetwork,
    resetAmounts,
    // methods
    getQuote,
    trade,
    handleAmountChange,
  };
}
