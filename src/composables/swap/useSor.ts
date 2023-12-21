import {
  SubgraphPoolBase,
  SwapType,
  SwapTypes,
  parseFixed,
} from '@balancer-labs/sdk';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import {
  AddressZero,
  WeiPerEther as ONE,
  Zero,
} from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useI18n } from 'vue-i18n';

import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { bnum } from '@/lib/utils';
import {
  SorManager,
  SorReturn,
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import { convertStEthWrap, isStEthAddress } from '@/lib/utils/balancer/lido';
import { useSwapper } from '@/composables/useSwapper';
import {
  getWrapOutput,
  unwrap,
  wrap,
  WrapType,
} from '@/lib/utils/balancer/wrapper';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

import useEthers from '../useEthers';
import useFathom from '../useFathom';
import useNumbers, { FNumFormats } from '../useNumbers';
import { isMainnet } from '../useNetwork';
import { useTokens } from '@/providers/tokens.provider';
import useTransactions, { TransactionAction } from '../useTransactions';
import { SwapQuote } from './types';
import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { captureBalancerException, isUserError } from '@/lib/utils/errors';

type SorState = {
  validationErrors: {
    highPriceImpact: boolean;
    noSwaps: boolean;
  };
  submissionError: string | null;
};

const GAS_PRICE = import.meta.env.VITE_GAS_PRICE || '100000000000';
const MAX_POOLS = import.meta.env.VITE_MAX_POOLS || '4';
const MIN_PRICE_IMPACT = 0.0001;
const HIGH_PRICE_IMPACT_THRESHOLD = 0.05;
const state = reactive<SorState>({
  validationErrors: {
    highPriceImpact: false,
    noSwaps: false,
  },
  submissionError: null,
});

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: Ref<string>;
  tokenInAmountInput: Ref<string>;
  tokenOutAddressInput: Ref<string>;
  tokenOutAmountInput: Ref<string>;
  wrapType: Ref<WrapType>;
  tokenInAmountScaled?: ComputedRef<BigNumber>;
  tokenOutAmountScaled?: ComputedRef<BigNumber>;
  sorConfig?: {
    handleAmountsOnFetchPools: boolean;
  };
  tokenIn: ComputedRef<TokenInfo>;
  tokenOut: ComputedRef<TokenInfo>;
  slippageBufferRate: ComputedRef<number>;
  isCowswapSwap: ComputedRef<boolean>;
};

export type UseSor = ReturnType<typeof useSor>;

/**
 * Calculates the difference between the price the user is receiving
 * and the market price of the token.
 * The variable token is the token has it's amount calculated by SOR
 *  - If the swap type is ExactIn, this is the output token
 *  - If the swap type is ExactOut, this is the input token
 * The fixed token is the token that has a fixed amount the user set.
 * This is the opposite of the variable token.
 * @param sellTokenAmount - The amount of the token being sold in native amounts (so 25 USDC = 25000000)
 * @param sellTokenDecimals - The number of decimals the sell token has
 * @param buyTokenAmount - The amount of the token being bought in native amounts (so 25 USDC = 25000000)
 * @param buyTokenDecimals - The number of decimals the buy token has
 * @param swapType - The type of swap we are doing
 * @param marketSp - The market spot price of the token pair
 * @returns
 */
export function calcPriceImpact(
  sellTokenAmount: BigNumber,
  sellTokenDecimals: number,
  buyTokenAmount: BigNumber,
  buyTokenDecimals: number,
  swapType: SwapType,
  marketSp: string
): BigNumber {
  // Scale the sellToken by the buyToken decimals and vice versa so they are both the same scale
  const sellTokenScaled = parseFixed(
    sellTokenAmount.toString(),
    buyTokenDecimals
  );
  const buyTokenScaled = parseFixed(
    buyTokenAmount.toString(),
    sellTokenDecimals
  );

  const SCALE = 18;
  const scalingFactor = BigNumber.from(10).pow(SCALE);

  const effectivePrice = sellTokenScaled.mul(scalingFactor).div(buyTokenScaled);
  const marketSpScaled = parseFixed(marketSp, SCALE);

  let priceRatio;
  if (swapType == SwapType.SwapExactIn) {
    // If we are swapping exact in the buy token is the variable one so we need
    // to divide the market spot price by it to get the ratio of expectedPrice:actualPrice
    priceRatio = marketSpScaled.mul(scalingFactor).div(effectivePrice);
  } else {
    // If we are swapping exact out the sell token is the variable one so we need
    // to divide it by the market spot price to get the ratio of expectedPrice:actualPrice
    priceRatio = effectivePrice.mul(scalingFactor).div(marketSpScaled);
  }

  // We don't care about > 4 decimal places for price impacts and sometimes
  // there are rounding errors with repeating numbers so we round to 4 decimal places
  const maxDecimalPlaces = 4;
  const priceRatioRounded = Math.round(
    priceRatio.div(BigNumber.from(10).pow(SCALE - maxDecimalPlaces))
  );
  priceRatio = BigNumber.from(priceRatioRounded).mul(
    BigNumber.from(10).pow(SCALE - maxDecimalPlaces)
  );

  const priceImpact = ONE.sub(priceRatio);
  return priceImpact;
}

const sorManager = new SorManager(
  rpcProviderService.jsonProvider,
  BigNumber.from(GAS_PRICE),
  Number(MAX_POOLS)
);

export default function useSor({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  wrapType,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  sorConfig = {
    handleAmountsOnFetchPools: true,
  },
  tokenIn,
  tokenOut,
  slippageBufferRate,
  isCowswapSwap,
}: Props) {
  const pools = ref<SubgraphPoolBase[]>([]);
  const sorReturn = ref<SorReturn>({
    hasSwaps: false,
    tokenIn: '',
    tokenOut: '',
    returnDecimals: 18,
    returnAmount: Zero,
    marketSpNormalised: '0',
    result: {
      tokenAddresses: [],
      swaps: [],
      swapAmount: Zero,
      returnAmount: Zero,
      returnAmountConsideringFees: Zero,
      tokenIn: '',
      tokenOut: '',
      marketSp: '0',
      swapAmountForSwaps: Zero,
      returnAmountFromSwaps: Zero,
    },
  });
  const swapping = ref(false);
  const confirming = ref(false);
  const priceImpact = ref(0);
  const latestTxHash = ref('');
  const poolsLoading = ref(true);

  // COMPOSABLES
  const { account, getProvider: getWeb3Provider, appNetworkConfig } = useWeb3();
  const provider = computed(() => getWeb3Provider());
  const { trackGoal, Goals } = useFathom();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { fNum, toFiat } = useNumbers();
  const { t } = useI18n();
  const { injectTokens, priceFor, getToken } = useTokens();
  const { swapIn, swapOut } = useSwapper();

  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (tokenInAddressInput.value && !getToken(tokenInAddressInput.value)) {
      unknownAssets.push(tokenInAddressInput.value);
    }
    if (tokenOutAddressInput.value && !getToken(tokenOutAddressInput.value)) {
      unknownAssets.push(tokenOutAddressInput.value);
    }
    await injectTokens(unknownAssets);
    await fetchPools();
    await handleAmountChange();
  });

  function resetState() {
    state.validationErrors.highPriceImpact = false;
    state.validationErrors.noSwaps = false;

    state.submissionError = null;
  }

  async function fetchPools(): Promise<void> {
    if (!sorManager) {
      return;
    }

    console.time('[SOR] fetchPools');
    await sorManager.fetchPools();
    console.timeEnd('[SOR] fetchPools');
    poolsLoading.value = false;
    // Updates any swaps with up to date pools/balances
    if (sorConfig.handleAmountsOnFetchPools) {
      handleAmountChange();
    }
  }

  function trackSwapEvent() {
    trackGoal(Goals.BalancerSwap);
    if (isMainnet.value) trackGoal(Goals.BalancerSwapMainnet);
  }

  async function updateSwapAmounts(): Promise<void> {
    if (!sorManager) {
      return;
    }
    if (sorReturn.value.hasSwaps && !confirming.value) {
      const { result } = sorReturn.value;

      const swapType: SwapType = exactIn.value
        ? SwapType.SwapExactIn
        : SwapType.SwapExactOut;

      const deltas = await getBalancerSDK().swaps.queryBatchSwap({
        kind: swapType,
        swaps: result.swaps,
        assets: result.tokenAddresses,
      });

      if (result !== sorReturn.value.result) {
        // sorReturn was updated while we were querying, abort to not show stale data.
        return;
      }

      if (deltas.length >= 2) {
        const tokenInDecimals = getTokenDecimals(tokenInAddressInput.value);
        const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput.value);

        let tokenInAddress =
          tokenInAddressInput.value === NATIVE_ASSET_ADDRESS
            ? AddressZero
            : tokenInAddressInput.value;
        let tokenOutAddress =
          tokenOutAddressInput.value === NATIVE_ASSET_ADDRESS
            ? AddressZero
            : tokenOutAddressInput.value;

        // If the token in/out is stETH then finding the token position
        // below doesn't work because result.tokenAddresses only includes
        // wstETH. This is a crude hack to replace token in/out address
        // with wstETH so the index mapping works.
        if (isStEthAddress(tokenInAddressInput.value))
          tokenInAddress = configService.network.tokens.Addresses.wstETH || '';
        if (isStEthAddress(tokenOutAddressInput.value))
          tokenOutAddress = configService.network.tokens.Addresses.wstETH || '';

        const tokenInPosition = result.tokenAddresses.indexOf(
          tokenInAddress.toLowerCase()
        );
        const tokenOutPosition = result.tokenAddresses.indexOf(
          tokenOutAddress.toLowerCase()
        );

        if (swapType === SwapType.SwapExactOut) {
          let tokenInAmount = deltas[tokenInPosition]
            ? BigNumber.from(deltas[tokenInPosition]).abs()
            : BigNumber.from(0);
          tokenInAmount = await mutateAmount({
            amount: tokenInAmount,
            address: tokenInAddressInput.value,
            isInputToken: false,
          });

          tokenInAmountInput.value = tokenInAmount.gt(0)
            ? formatAmount(formatUnits(tokenInAmount, tokenInDecimals))
            : '';
        }

        if (swapType === SwapType.SwapExactIn) {
          let tokenOutAmount = deltas[tokenOutPosition]
            ? BigNumber.from(deltas[tokenOutPosition]).abs()
            : BigNumber.from(0);
          tokenOutAmount = await mutateAmount({
            amount: tokenOutAmount,
            address: tokenOutAddressInput.value,
            isInputToken: false,
          });

          tokenOutAmountInput.value = tokenOutAmount.gt(0)
            ? formatAmount(formatUnits(tokenOutAmount, tokenOutDecimals))
            : '';
        }
      }
    }
  }

  function resetInputAmounts(amount: string): void {
    if (exactIn.value && bnum(amount).isZero()) {
      tokenOutAmountInput.value = '';
    } else if (!exactIn.value && bnum(amount).isZero()) {
      tokenInAmountInput.value = '';
    } else {
      tokenInAmountInput.value = amount;
      tokenOutAmountInput.value = amount;
    }

    priceImpact.value = 0;
    sorReturn.value.hasSwaps = false;
    sorReturn.value.returnAmount = Zero;
  }

  async function handleAmountChange(): Promise<void> {
    if (isCowswapSwap.value) {
      return;
    }

    let amount = exactIn.value
      ? tokenInAmountInput.value
      : tokenOutAmountInput.value;
    // Avoid using SOR if querying a zero value or (un)wrapping swap
    const zeroValueSwap = amount === '' || bnum(amount).isZero();
    if (zeroValueSwap) {
      resetInputAmounts(amount);
      return;
    }

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;

    if (!tokenInAddress || !tokenOutAddress) {
      if (exactIn.value) tokenOutAmountInput.value = '';
      else tokenInAmountInput.value = '';
      return;
    }

    const tokenInDecimals = getTokenDecimals(tokenInAddressInput.value);
    const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput.value);

    const inputAmountDecimals = exactIn.value
      ? tokenInDecimals
      : tokenOutDecimals;
    amount = overflowProtected(amount, inputAmountDecimals);

    if (wrapType.value !== WrapType.NonWrap) {
      const wrapper =
        wrapType.value === WrapType.Wrap ? tokenOutAddress : tokenInAddress;

      if (exactIn.value) {
        tokenInAmountInput.value = amount;

        const outputAmount = await getWrapOutput(
          wrapper,
          wrapType.value,
          parseFixed(amount, tokenInDecimals)
        );
        tokenOutAmountInput.value = formatFixed(outputAmount, tokenInDecimals);
      } else {
        tokenOutAmountInput.value = amount;

        const inputAmount = await getWrapOutput(
          wrapper,
          wrapType.value === WrapType.Wrap ? WrapType.Unwrap : WrapType.Wrap,
          parseFixed(amount, tokenOutDecimals)
        );
        tokenInAmountInput.value = formatFixed(inputAmount, tokenOutDecimals);
      }

      sorReturn.value.hasSwaps = false;
      priceImpact.value = 0;
      return;
    }

    if (!sorManager || !sorManager.hasPoolData()) {
      if (exactIn.value) tokenOutAmountInput.value = '';
      else tokenInAmountInput.value = '';
      return;
    }

    if (exactIn.value) {
      await setSwapCost(
        tokenOutAddressInput.value,
        tokenOutDecimals,
        sorManager
      );

      let tokenInAmountScaled = parseUnits(amount, tokenInDecimals);

      console.log('[SOR Manager] swapExactIn');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactIn,
        tokenInAmountScaled
      );

      sorReturn.value = swapReturn;
      let tokenOutAmount = swapReturn.returnAmount;

      tokenOutAmountInput.value = tokenOutAmount.gt(0)
        ? formatAmount(formatUnits(tokenOutAmount, tokenOutDecimals))
        : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
        state.validationErrors.noSwaps = true;
      } else {
        // If either in/out address is stETH we should mutate the value for the
        // priceImpact calculation.
        tokenInAmountScaled = await mutateAmount({
          amount: tokenInAmountScaled,
          address: tokenInAddress,
          isInputToken: true,
        });
        tokenOutAmount = await mutateAmount({
          amount: tokenOutAmount,
          address: tokenOutAddress,
          isInputToken: false,
        });
        const priceImpactCalc = calcPriceImpact(
          tokenInAmountScaled,
          tokenInDecimals,
          tokenOutAmount,
          tokenOutDecimals,
          SwapType.SwapExactIn,
          swapReturn.marketSpNormalised
        );

        priceImpact.value = Math.max(
          Number(formatUnits(priceImpactCalc)),
          MIN_PRICE_IMPACT
        );
      }
    } else {
      // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
      await setSwapCost(tokenInAddressInput.value, tokenInDecimals, sorManager);

      let tokenOutAmountScaled = parseUnits(amount, tokenOutDecimals);

      console.log('[SOR Manager] swapExactOut');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactOut,
        tokenOutAmountScaled
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?

      let tokenInAmount = swapReturn.returnAmount;
      tokenInAmountInput.value = tokenInAmount.gt(0)
        ? formatAmount(formatUnits(tokenInAmount, tokenInDecimals))
        : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
        state.validationErrors.noSwaps = true;
      } else {
        // If either in/out address is stETH we should mutate the value for the
        // priceImpact calculation.
        tokenOutAmountScaled = await mutateAmount({
          amount: tokenOutAmountScaled,
          address: tokenOutAddress,
          isInputToken: true,
        });
        tokenInAmount = await mutateAmount({
          amount: tokenInAmount,
          address: tokenInAddress,
          isInputToken: false,
        });
        const priceImpactCalc = calcPriceImpact(
          tokenInAmount,
          tokenInDecimals,
          tokenOutAmountScaled,
          tokenOutDecimals,
          SwapType.SwapExactIn,
          swapReturn.marketSpNormalised
        );

        priceImpact.value = Math.max(
          Number(formatUnits(priceImpactCalc)),
          MIN_PRICE_IMPACT
        );
      }
    }

    pools.value = sorManager.selectedPools;

    state.validationErrors.highPriceImpact =
      priceImpact.value >= HIGH_PRICE_IMPACT_THRESHOLD;
  }

  function txHandler(tx: TransactionResponse, action: TransactionAction): void {
    confirming.value = false;

    let summary = '';
    const tokenInAmountFormatted = fNum(tokenInAmountInput.value, {
      ...FNumFormats.token,
      maximumSignificantDigits: 6,
    });
    const tokenOutAmountFormatted = fNum(tokenOutAmountInput.value, {
      ...FNumFormats.token,
      maximumSignificantDigits: 6,
    });

    const tokenInSymbol = tokenIn.value.symbol;
    const tokenOutSymbol = tokenOut.value.symbol;

    if (['wrap', 'unwrap'].includes(action)) {
      summary = t('transactionSummary.wrapUnwrap', [
        tokenInAmountFormatted,
        tokenInSymbol,
        tokenOutSymbol,
      ]);
    } else {
      summary = `${tokenInAmountFormatted} ${tokenInSymbol} -> ${tokenOutAmountFormatted} ${tokenOutSymbol}`;
    }

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action,
      summary,
      details: {
        tokenIn: tokenIn.value,
        tokenOut: tokenOut.value,
        tokenInAddress: tokenInAddressInput.value,
        tokenOutAddress: tokenOutAddressInput.value,
        tokenInAmount: tokenInAmountInput.value,
        tokenOutAmount: tokenOutAmountInput.value,
        exactIn: exactIn.value,
        quote: getQuote(),
        priceImpact: priceImpact.value,
        slippageBufferRate: slippageBufferRate.value,
      },
    });

    const swapUSDValue =
      toFiat(tokenInAmountInput.value, tokenInAddressInput.value) || '0';

    txListener(tx, {
      onTxConfirmed: async () => {
        trackGoal(Goals.Swapped, bnum(swapUSDValue).times(100).toNumber() || 0);
        swapping.value = false;
        latestTxHash.value = tx.hash;
      },
      onTxFailed: () => {
        swapping.value = false;
      },
    });
  }

  async function swap(successCallback?: () => void) {
    trackGoal(Goals.ClickSwap);
    swapping.value = true;
    confirming.value = true;
    state.submissionError = null;

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;
    const tokenInDecimals = getToken(tokenInAddress).decimals;
    const tokenOutDecimals = getToken(tokenOutAddress).decimals;
    const tokenInAmountScaled = parseFixed(
      tokenInAmountInput.value,
      tokenInDecimals
    );

    if (wrapType.value == WrapType.Wrap) {
      try {
        const tx = await wrap(
          appNetworkConfig.key,
          provider.value as any,
          tokenOutAddress,
          tokenInAmountScaled
        );
        console.log('Wrap tx', tx);

        txHandler(tx, 'wrap');

        if (successCallback != null) {
          successCallback();
        }
        trackSwapEvent();
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress);
      }
      return;
    } else if (wrapType.value == WrapType.Unwrap) {
      try {
        const tx = await unwrap(
          appNetworkConfig.key,
          provider.value as any,
          tokenInAddress,
          tokenInAmountScaled
        );
        console.log('Unwrap tx', tx);

        txHandler(tx, 'unwrap');

        if (successCallback != null) {
          successCallback();
        }
        trackSwapEvent();
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress);
      }
      return;
    }

    if (exactIn.value) {
      const tokenOutAmount = parseFixed(
        tokenOutAmountInput.value,
        tokenOutDecimals
      );
      const minAmount = getMinOut(tokenOutAmount);
      const sr: SorReturn = sorReturn.value as SorReturn;

      try {
        const tx = await swapIn(sr, tokenInAmountScaled, minAmount);
        console.log('Swap in tx', tx);

        txHandler(tx, 'swap');

        if (successCallback != null) {
          successCallback();
        }
        trackSwapEvent();
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress);
      }
    } else {
      const tokenInAmountMax = getMaxIn(tokenInAmountScaled);
      const sr: SorReturn = sorReturn.value as SorReturn;
      const tokenOutAmountScaled = parseFixed(
        tokenOutAmountInput.value,
        tokenOutDecimals
      );

      try {
        const tx = await swapOut(sr, tokenInAmountMax, tokenOutAmountScaled);
        console.log('Swap out tx', tx);

        txHandler(tx, 'swap');

        if (successCallback != null) {
          successCallback();
        }
        trackSwapEvent();
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress);
      }
    }
  }

  // Uses stored market prices to calculate price of native asset in terms of token
  function calculateEthPriceInToken(tokenAddress: string): number {
    const ethPriceFiat = priceFor(appNetworkConfig.nativeAsset.address);
    const tokenPriceFiat = priceFor(tokenAddress);
    if (tokenPriceFiat === 0) return 0;
    const ethPriceToken = ethPriceFiat / tokenPriceFiat;
    return ethPriceToken;
  }

  // Sets SOR swap cost for more efficient routing
  async function setSwapCost(
    tokenAddress: string,
    tokenDecimals: number,
    sorManager: SorManager
  ): Promise<void> {
    await sorManager.setCostOutputToken(
      tokenAddress,
      tokenDecimals,
      calculateEthPriceInToken(tokenAddress).toString()
    );
  }

  function getMaxIn(amount: BigNumber) {
    return amount
      .mul(parseFixed(String(1 + slippageBufferRate.value), 18))
      .div(ONE);
  }

  function getMinOut(amount: BigNumber) {
    return amount
      .mul(ONE)
      .div(parseFixed(String(1 + slippageBufferRate.value), 18));
  }

  function getQuote(): SwapQuote {
    const maximumInAmount =
      tokenInAmountScaled != null ? getMaxIn(tokenInAmountScaled.value) : Zero;

    const minimumOutAmount =
      tokenOutAmountScaled != null
        ? getMinOut(tokenOutAmountScaled.value)
        : Zero;

    return {
      feeAmountInToken: '0',
      feeAmountOutToken: '0',
      maximumInAmount,
      minimumOutAmount,
    };
  }

  function formatAmount(amount: string) {
    return fNum(amount, {
      maximumSignificantDigits: 6,
      useGrouping: false,
      fixedFormat: true,
    });
  }

  function getTokenDecimals(tokenAddress: string) {
    return getToken(tokenAddress)?.decimals;
  }

  /**
   * mutateAmount
   *
   * Handles any conditions where the token in or out needs to be mutated for
   * display purposes. The only case we have so far is if the token in or out
   * is stETH, the actual return amount from the SOR is wstETH. So we need to
   * convert the wstETH amount to stETH using the exchange rate.
   *
   * @param {BigNumber} amount - Amount to parse (could be tokenIn or tokenOut amount).
   * @param {string} address - Token address for amount.
   * @param {boolean} isInputToken - Is this the token being specified?
   * @returns {BigNumber} A new amount if conditions are met or the same amount
   * as passed in.
   */
  async function mutateAmount({
    amount,
    address,
    isInputToken,
  }: {
    amount: BigNumber;
    address: string;
    isInputToken: boolean;
  }): Promise<BigNumber> {
    if (isStEthAddress(address) && isMainnet.value) {
      return convertStEthWrap({ amount, isWrap: isInputToken });
    }
    return amount;
  }

  function handleSwapException(
    error: Error,
    tokenIn: string,
    tokenOut: string
  ) {
    if (!isUserError(error)) {
      console.trace(error);
      state.submissionError = t('swapException', ['Balancer']);

      captureBalancerException({
        error,
        action: 'swap',
        msgPrefix: state.submissionError,
        context: {
          extra: {
            sender: account.value,
            tokenIn,
            tokenOut,
          },
          tags: {
            swapType: 'balancer',
          },
        },
      });
    }
    swapping.value = false;
    confirming.value = false;
    throw error;
  }

  return {
    ...toRefs(state),
    sorManager,
    sorReturn,
    pools,
    handleAmountChange,
    exactIn,
    swap,
    swapping,
    priceImpact,
    latestTxHash,
    fetchPools,
    poolsLoading,
    getQuote,
    resetState,
    confirming,
    updateSwapAmounts,
    resetInputAmounts,
    // For Tests
    setSwapCost,
  };
}
