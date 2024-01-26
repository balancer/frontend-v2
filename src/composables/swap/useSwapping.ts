import { useSwapAssets } from '@/composables/swap/useSwapAssets';
import { parseFixed } from '@ethersproject/bignumber';

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

export type SwapRoute = 'wrapUnwrap' | 'balancer' | 'cowswap' | 'joinExit';

export type UseSwapping = ReturnType<typeof useSwapping>;

export const swapGasless = ref<boolean>(false);

export default function useSwapping(
  exactIn: Ref<boolean>,
  tokenInAddressInput: Ref<string>,
  tokenInAmountInput: Ref<string>,
  tokenOutAddressInput: Ref<string>,
  tokenOutAmountInput: Ref<string>
) {
  // COMPOSABLES
  const { fNum } = useNumbers();
  const { getToken, tokens } = useTokens();
  const { blockNumber } = useWeb3();
  const { slippage } = useUserSettings();
  const { setInputAsset, setOutputAsset } = useSwapAssets();

  // COMPUTED
  const slippageBufferRate = computed(() => parseFloat(slippage.value));

  const wrapType = computed(() =>
    getWrapAction(tokenInAddressInput.value, tokenOutAddressInput.value)
  );
  const isWrap = computed(() => wrapType.value === WrapType.Wrap);
  const isUnwrap = computed(() => wrapType.value === WrapType.Unwrap);

  const tokenIn = computed(() => getToken(tokenInAddressInput.value));

  const tokenOut = computed(() => getToken(tokenOutAddressInput.value));

  const isNativeAssetSwap = computed(
    () => tokenInAddressInput.value === NATIVE_ASSET_ADDRESS
  );

  const tokenInAmountScaled = computed(() =>
    parseFixed(tokenInAmountInput.value || '0', tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    parseFixed(tokenOutAmountInput.value || '0', tokenOut.value.decimals)
  );

  const requiresTokenApproval = computed(() => {
    if (wrapType.value === WrapType.Unwrap || isNativeAssetSwap.value) {
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
          bnum(tokenOutAmount).div(tokenInAmount).toString(),
          FNumFormats.token
        )} ${tokenOut.value?.symbol}`,
        tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum(
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

  const swapRoute = computed<SwapRoute>(() => {
    if (wrapType.value !== WrapType.NonWrap) {
      return 'wrapUnwrap';
    } else if (isNativeAssetSwap.value) {
      return 'balancer';
    }

    if (swapGasless.value && isCowswapSupportedOnNetwork.value) {
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
      // Currently joinExit swap is only suitable for ExactIn and non-eth swaps
      return joinExitSwapPresent ? 'joinExit' : 'balancer';
    }
  });

  const isCowswapSwap = computed(() => swapRoute.value === 'cowswap');

  const isBalancerSwap = computed(() => swapRoute.value === 'balancer');

  const isJoinExitSwap = computed(() => swapRoute.value === 'joinExit');

  const isWrapUnwrapSwap = computed(() => swapRoute.value === 'wrapUnwrap');

  const isGaslessSwappingDisabled = computed(
    () => isNativeAssetSwap.value || isWrapUnwrapSwap.value
  );

  const hasSwapQuote = computed(
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
    isCowswapSwap,
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
    if (hasSwapQuote.value || isWrapUnwrapSwap.value) {
      return false;
    }

    if (isCowswapSwap.value) {
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
  async function swap(successCallback?: () => void) {
    if (isCowswapSwap.value) {
      return cowswap.swap(() => {
        if (successCallback) {
          successCallback();
        }

        cowswap.resetState();
      });
    } else if (isJoinExitSwap.value) {
      return joinExit.swap(() => {
        if (successCallback) {
          successCallback();
        }

        joinExit.resetState();
      });
    } else {
      // handles both Balancer and Wrap/Unwrap swaps
      return sor.swap(() => {
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

  function setSwapGasless(flag: boolean) {
    swapGasless.value = flag;

    lsSet(LS_KEYS.Swap.Gasless, swapGasless.value);
  }

  function toggleSwapGasless() {
    setSwapGasless(!swapGasless.value);

    handleAmountChange();
  }

  function getQuote() {
    if (isCowswapSwap.value) {
      return cowswap.getQuote();
    }
    if (isJoinExitSwap.value) {
      return joinExit.getQuote();
    }
    return sor.getQuote();
  }

  function resetAmounts() {
    sor.resetInputAmounts('');
  }

  async function handleAmountChange() {
    if (exactIn.value) {
      tokenOutAmountInput.value = '';
    } else {
      tokenInAmountInput.value = '';
    }

    cowswap.resetState(false);
    sor.resetState();
    joinExit.resetState();

    if (isCowswapSwap.value) {
      cowswap.handleAmountChange();
    } else {
      await sor.handleAmountChange();
      await joinExit.handleAmountChange();
    }
  }

  // WATCHERS
  watch(tokenInAddressInput, async () => {
    setInputAsset(tokenInAddressInput.value);

    handleAmountChange();
  });

  watch(tokenOutAddressInput, () => {
    setOutputAsset(tokenOutAddressInput.value);

    handleAmountChange();
  });

  onMounted(() => {
    const gaslessDisabled = window.location.href.includes('gasless=false');

    if (gaslessDisabled) {
      setSwapGasless(false);
    }
  });

  watch(blockNumber, () => {
    if (isCowswapSwap.value) {
      if (!cowswap.hasValidationError.value) {
        cowswap.handleAmountChange();
      }
    } else if (isJoinExitSwap.value) {
      if (!joinExit.hasValidationError.value) {
        joinExit.handleAmountChange();
      }
    } else if (isBalancerSwap.value) {
      sor.updateSwapAmounts();
    }
  });

  watch(slippageBufferRate, () => {
    handleAmountChange();
  });

  return {
    // computed
    isWrap,
    isUnwrap,
    isNativeAssetSwap,
    tokenIn,
    tokenOut,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokens,
    requiresTokenApproval,
    effectivePriceMessage,
    swapRoute,
    exactIn,
    isLoading,
    cowswap,
    sor,
    joinExit,
    isCowswapSwap,
    isBalancerSwap,
    isJoinExitSwap,
    wrapType,
    isWrapUnwrapSwap,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    slippageBufferRate,
    isConfirming,
    submissionError,
    resetSubmissionError,
    swapGasless,
    toggleSwapGasless,
    isGaslessSwappingDisabled,
    isCowswapSupportedOnNetwork,
    resetAmounts,
    // methods
    getQuote,
    swap,
    handleAmountChange,
  };
}
