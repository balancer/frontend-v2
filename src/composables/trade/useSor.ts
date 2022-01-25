import {
  Ref,
  onMounted,
  ref,
  computed,
  ComputedRef,
  reactive,
  toRefs
} from 'vue';
import { useStore } from 'vuex';
import { useIntervalFn } from '@vueuse/core';
import { BigNumber, parseFixed, formatFixed } from '@ethersproject/bignumber';
import { Zero, WeiPerEther as ONE } from '@ethersproject/constants';
import { BigNumber as OldBigNumber } from 'bignumber.js';
import { Pool } from '@balancer-labs/sor/dist/types';
import { SubgraphPoolBase, SwapTypes } from '@balancer-labs/sdk';
import { useI18n } from 'vue-i18n';

import { scale, bnum } from '@/lib/utils';
import {
  getWrapOutput,
  unwrap,
  wrap,
  WrapType
} from '@/lib/utils/balancer/wrapper';
import {
  SorManager,
  SorReturn,
  LiquiditySelection
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import { swapIn, swapOut } from '@/lib/utils/balancer/swapper';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import useFathom from '../useFathom';
import useWeb3 from '@/services/web3/useWeb3';

import { TransactionResponse } from '@ethersproject/providers';
import useEthers from '../useEthers';
import { TradeQuote } from './types';
import useTransactions, { TransactionAction } from '../useTransactions';
import useNumbers from '../useNumbers';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import useTokens from '../useTokens';
import { getStETHByWstETH } from '@/lib/utils/balancer/lido';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

type SorState = {
  validationErrors: {
    highPriceImpact: boolean;
  };
  submissionError: string | null;
};

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = process.env.VUE_APP_MAX_POOLS || '4';
const MIN_PRICE_IMPACT = 0.0001;
const HIGH_PRICE_IMPACT_THRESHOLD = 0.05;
const state = reactive<SorState>({
  validationErrors: {
    highPriceImpact: false
  },
  submissionError: null
});

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: string;
  tokenInAmountInput: string;
  tokenOutAddressInput: string;
  tokenOutAmountInput: string;
  tokens: Ref<TokenInfoMap>;
  wrapType: Ref<WrapType>;
  tokenInAmountScaled?: ComputedRef<BigNumber>;
  tokenOutAmountScaled?: ComputedRef<BigNumber>;
  sorConfig?: {
    refetchPools: boolean;
    handleAmountsOnFetchPools: boolean;
  };
  tokenIn: ComputedRef<TokenInfo>;
  tokenOut: ComputedRef<TokenInfo>;
  slippageBufferRate: ComputedRef<number>;
};

export type UseSor = ReturnType<typeof useSor>;

export default function useSor({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokens,
  wrapType,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  sorConfig = {
    refetchPools: true,
    handleAmountsOnFetchPools: true
  },
  tokenIn,
  tokenOut,
  slippageBufferRate
}: Props) {
  let sorManager: SorManager | undefined = undefined;
  const pools = ref<(Pool | SubgraphPoolBase)[]>([]);
  const sorReturn = ref<SorReturn>({
    isV1swap: false,
    isV1best: false,
    hasSwaps: false,
    tokenIn: '',
    tokenOut: '',
    returnDecimals: 18,
    returnAmount: Zero,
    marketSpNormalised: '0',
    v1result: [[], Zero, new OldBigNumber(0)],
    v2result: {
      tokenAddresses: [],
      swaps: [],
      swapAmount: Zero,
      returnAmount: Zero,
      returnAmountConsideringFees: Zero,
      tokenIn: '',
      tokenOut: '',
      marketSp: '0'
    }
  });
  const trading = ref(false);
  const confirming = ref(false);
  const priceImpact = ref(0);
  const latestTxHash = ref('');
  const poolsLoading = ref(true);

  // COMPOSABLES
  const store = useStore();
  const {
    getProvider: getWeb3Provider,
    isV1Supported,
    appNetworkConfig
  } = useWeb3();
  const provider = computed(() => getWeb3Provider());
  const { trackGoal, Goals } = useFathom();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { fNum } = useNumbers();
  const { t } = useI18n();
  const { injectTokens, priceFor } = useTokens();

  const liquiditySelection = computed(() => store.state.app.tradeLiquidity);

  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (tokenInAddressInput && !tokens.value[tokenInAddressInput]) {
      unknownAssets.push(tokenInAddressInput);
    }
    if (
      tokenOutAddressInput &&
      !tokens.value[tokenOutAddressInput]
    ) {
      unknownAssets.push(tokenOutAddressInput);
    }
    await injectTokens(unknownAssets);
    await initSor();
    await handleAmountChange();
  });

  useIntervalFn(async () => {
    if (sorConfig.refetchPools && sorManager) {
      fetchPools();
    }
  }, 30 * 1e3);

  function resetState() {
    state.validationErrors.highPriceImpact = false;

    state.submissionError = null;
  }

  async function initSor(): Promise<void> {
    const poolsUrlV1 = `${
      configService.network.poolsUrlV1
    }?timestamp=${Date.now()}`;

    // If V1 previously selected on another network then it uses this and returns no liquidity.
    if (!isV1Supported) {
      store.commit('app/setTradeLiquidity', LiquiditySelection.V2);
    }

    sorManager = new SorManager(
      isV1Supported,
      rpcProviderService.jsonProvider,
      BigNumber.from(GAS_PRICE),
      Number(MAX_POOLS),
      configService.network.chainId,
      configService.network.addresses.weth,
      poolsUrlV1
    );

    fetchPools();
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

  async function handleAmountChange() {
    const amount = exactIn.value
      ? tokenInAmountInput
      : tokenOutAmountInput;
    const amounts = {
      tokenInAmountInput,
      tokenOutAmountInput
    }
    // Avoid using SOR if querying a zero value or (un)wrapping trade
    const zeroValueTrade = amount === '' || amount === '0';
    if (zeroValueTrade) {
      tokenInAmountInput = amount;
      tokenOutAmountInput = amount;
      priceImpact.value = 0;
      sorReturn.value.hasSwaps = false;
      sorReturn.value.returnAmount = Zero;
      return amounts;
    }

    const tokenInAddress = tokenInAddressInput;
    const tokenOutAddress = tokenOutAddressInput;

    if (!tokenInAddress || !tokenOutAddress) {
      if (exactIn.value) amounts.tokenOutAmountInput = '';
      else amounts.tokenInAmountInput = '';
      return amounts;
    }

    const tokenInDecimals = tokens.value[tokenInAddressInput]?.decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddressInput]?.decimals;

    if (wrapType.value !== WrapType.NonWrap) {
      const wrapper =
        wrapType.value === WrapType.Wrap ? tokenOutAddress : tokenInAddress;

      if (exactIn.value) {
        amounts.tokenInAmountInput = amount;

        const outputAmount = await getWrapOutput(
          wrapper,
          wrapType.value,
          parseFixed(amount, tokenInDecimals)
        );
        amounts.tokenOutAmountInput = formatFixed(outputAmount, tokenInDecimals);
      } else {
        amounts.tokenOutAmountInput = amount;

        const inputAmount = await getWrapOutput(
          wrapper,
          wrapType.value === WrapType.Wrap ? WrapType.Unwrap : WrapType.Wrap,
          parseFixed(amount, tokenOutDecimals)
        );
        amounts.tokenInAmountInput = formatFixed(inputAmount, tokenOutDecimals);
      }

      sorReturn.value.hasSwaps = false;
      priceImpact.value = 0;
      return amounts;
    }

    if (!sorManager || !sorManager.hasPoolData()) {
      if (exactIn.value) amounts.tokenOutAmountInput = '';
      else amounts.tokenInAmountInput = '';
      return amounts;
    }

    if (exactIn.value) {
      await setSwapCost(
        tokenOutAddressInput,
        tokenOutDecimals,
        sorManager
      );

      const tokenInAmountNormalised = new OldBigNumber(amount); // Normalized value
      const tokenInAmountScaled = scale(
        tokenInAmountNormalised,
        tokenInDecimals
      );

      console.log('[SOR Manager] swapExactIn');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactIn,
        tokenInAmountScaled,
        tokenInDecimals,
        liquiditySelection.value
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?
      const tokenOutAmountNormalised = bnum(
        formatFixed(swapReturn.returnAmount, tokenOutDecimals)
      );
      amounts.tokenOutAmountInput =
        tokenOutAmountNormalised.toNumber() > 0
          ? tokenOutAmountNormalised.toFixed(6, OldBigNumber.ROUND_DOWN)
          : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
      } else {
        let returnAmtNormalised = bnum(
          formatFixed(swapReturn.returnAmount, tokenOutDecimals)
        );

        returnAmtNormalised = await adjustedPiAmount(
          returnAmtNormalised,
          tokenOutAddress,
          tokenOutDecimals
        );

        const effectivePrice = tokenInAmountNormalised.div(returnAmtNormalised);
        const priceImpactCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        priceImpact.value = OldBigNumber.max(
          priceImpactCalc,
          MIN_PRICE_IMPACT
        ).toNumber();
      }
    } else {
      // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
      await setSwapCost(tokenInAddressInput, tokenInDecimals, sorManager);

      let tokenOutAmountNormalised = new OldBigNumber(amount);
      const tokenOutAmount = scale(tokenOutAmountNormalised, tokenOutDecimals);

      console.log('[SOR Manager] swapExactOut');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactOut,
        tokenOutAmount,
        tokenOutDecimals,
        liquiditySelection.value
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?

      const tradeAmount: BigNumber = swapReturn.returnAmount;
      const tokenInAmountNormalised = bnum(
        formatFixed(tradeAmount, tokenInDecimals)
      );
      amounts.tokenInAmountInput =
        tokenInAmountNormalised.toNumber() > 0
          ? tokenInAmountNormalised.toFixed(6, OldBigNumber.ROUND_UP)
          : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
      } else {
        tokenOutAmountNormalised = await adjustedPiAmount(
          tokenOutAmountNormalised,
          tokenOutAddress,
          tokenOutDecimals
        );

        const effectivePrice = tokenInAmountNormalised.div(
          tokenOutAmountNormalised
        );
        const priceImpactCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        priceImpact.value = OldBigNumber.max(
          priceImpactCalc,
          MIN_PRICE_IMPACT
        ).toNumber();
      }
    }

    pools.value = sorManager.selectedPools;

    state.validationErrors.highPriceImpact =
      priceImpact.value >= HIGH_PRICE_IMPACT_THRESHOLD;

      return amounts;
  }

  function txHandler(tx: TransactionResponse, action: TransactionAction): void {
    confirming.value = false;

    let summary = '';
    const tokenInAmountFormatted = fNum(tokenInAmountInput, 'token');
    const tokenOutAmountFormatted = fNum(tokenOutAmountInput, 'token');

    const tokenInSymbol = tokenIn.value.symbol;
    const tokenOutSymbol = tokenOut.value.symbol;

    if (['wrap', 'unwrap'].includes(action)) {
      summary = t('transactionSummary.wrapUnwrap', [
        tokenInAmountFormatted,
        tokenInSymbol,
        tokenOutSymbol
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
        tokenInAddress: tokenInAddressInput,
        tokenOutAddress: tokenOutAddressInput,
        tokenInAmount: tokenInAmountInput,
        tokenOutAmount: tokenOutAmountInput,
        exactIn: exactIn.value,
        quote: getQuote(),
        priceImpact: priceImpact.value,
        slippageBufferRate: slippageBufferRate.value
      }
    });

    txListener(tx, {
      onTxConfirmed: () => {
        trading.value = false;
        latestTxHash.value = tx.hash;
        trackGoal(Goals.Swapped);
      },
      onTxFailed: () => {
        trading.value = false;
      }
    });
  }

  async function trade(successCallback?: () => void) {
    trackGoal(Goals.ClickSwap);
    trading.value = true;
    confirming.value = true;
    state.submissionError = null;

    const tokenInAddress = tokenInAddressInput;
    const tokenOutAddress = tokenOutAddressInput;
    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;
    const tokenInAmountScaled = parseFixed(
      tokenInAmountInput,
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
      } catch (e) {
        console.log(e);
        state.submissionError = (e as Error).message;
        trading.value = false;
        confirming.value = false;
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
      } catch (e) {
        console.log(e);
        state.submissionError = (e as Error).message;
        trading.value = false;
        confirming.value = false;
      }
      return;
    }

    if (exactIn.value) {
      const tokenOutAmount = parseFixed(
        tokenOutAmountInput,
        tokenOutDecimals
      );
      const minAmount = getMinOut(tokenOutAmount);
      const sr: SorReturn = sorReturn.value as SorReturn;

      try {
        const tx = await swapIn(
          appNetworkConfig.key,
          provider.value as any,
          sr,
          tokenInAmountScaled,
          minAmount
        );
        console.log('Swap in tx', tx);

        txHandler(tx, 'trade');

        if (successCallback != null) {
          successCallback();
        }
      } catch (e) {
        console.log(e);
        state.submissionError = (e as Error).message;
        trading.value = false;
        confirming.value = false;
      }
    } else {
      const tokenInAmountMax = getMaxIn(tokenInAmountScaled);
      const sr: SorReturn = sorReturn.value as SorReturn;
      const tokenOutAmountScaled = parseFixed(
        tokenOutAmountInput,
        tokenOutDecimals
      );

      try {
        const tx = await swapOut(
          appNetworkConfig.key,
          provider.value as any,
          sr,
          tokenInAmountMax,
          tokenOutAmountScaled
        );
        console.log('Swap out tx', tx);

        txHandler(tx, 'trade');

        if (successCallback != null) {
          successCallback();
        }
      } catch (e) {
        console.log(e);
        state.submissionError = (e as Error).message;
        trading.value = false;
        confirming.value = false;
      }
    }
  }

  // Uses stored market prices to calculate price of native asset in terms of token
  function calculateEthPriceInToken(tokenAddress: string): OldBigNumber {
    const ethPriceFiat = priceFor(appNetworkConfig.nativeAsset.address);
    const tokenPriceFiat = priceFor(tokenAddress);
    if (tokenPriceFiat === 0) return bnum(0);
    const ethPriceToken = bnum(ethPriceFiat / tokenPriceFiat);
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

  function getQuote(): TradeQuote {
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
      minimumOutAmount
    };
  }

  /**
   * Under certain circumstance we need to adjust an amount
   * for the price impact calc due to background wrapping taking place
   * e.g. when trading weth to wstEth.
   */
  async function adjustedPiAmount(
    amount: OldBigNumber,
    address: string,
    decimals: number
  ): Promise<OldBigNumber> {
    if (address === appNetworkConfig.addresses.wstETH) {
      const denormAmount = parseUnits(amount.toString(), decimals);
      const denormStEthAmount = await getStETHByWstETH(denormAmount);
      return bnum(formatUnits(denormStEthAmount, decimals));
    }
    return amount;
  }

  return {
    ...toRefs(state),
    sorManager,
    sorReturn,
    pools,
    initSor,
    handleAmountChange,
    exactIn,
    trade,
    trading,
    priceImpact,
    latestTxHash,
    fetchPools,
    poolsLoading,
    getQuote,
    resetState,
    confirming,

    // For Tests
    setSwapCost
  };
}
