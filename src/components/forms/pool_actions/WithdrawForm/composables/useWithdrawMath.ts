/**
 * useWithdrawMath
 *
 * Returns state, computed properties and methods for the withdraw form math.
 *
 * TODO:
 * Requires major refactor following Boosted pools (StablePhantom) logic additions.
 */
import { formatUnits, parseUnits } from '@ethersproject/units';
import OldBigNumber from 'bignumber.js';
import { computed, Ref, ref, watch } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { tokensListExclBpt, usePoolHelper } from '@/composables/usePoolHelpers';
import usePromiseSequence from '@/composables/usePromiseSequence';
import useSlippage from '@/composables/useSlippage';
import { useTokens } from '@/providers/tokens.provider';
import { HIGH_PRICE_IMPACT } from '@/constants/poolLiquidity';
import { bnum, forChange, indexOfAddress, isSameAddress } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';
import { setError, WithdrawalError } from './useWithdrawalState';
import { cloneDeep, isEqual } from 'lodash';
import { SHALLOW_COMPOSABLE_STABLE_BUFFER } from '@/constants/pools';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { useTokenHelpers } from '@/composables/useTokenHelpers';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';

/**
 * TYPES
 */
export type WithdrawMathResponse = ReturnType<typeof useWithdrawMath>;

export default function useWithdrawMath(
  pool: Ref<Pool>,
  isProportional: Ref<boolean> = ref(true),
  tokensOut: Ref<string[]> = ref([]),
  tokenOut: Ref<string> = ref(''),
  tokenOutIndex: Ref<number> = ref(0)
) {
  /**
   * STATE
   */
  const propBptIn = ref<string>('0');
  const tokenOutAmount = ref<string>('');

  const loadingData = ref(false);
  const queryBptIn = ref<string>('');
  const evmGuideBptIn = ref<string>('0');

  // This array can be set by either a queryExit, a regular batch swap result
  // or a batch relayer result, if the batch swap returns 0.
  const fetchedSingleAssetMaxes = ref<string[]>([]);

  /**
   * COMPOSABLES
   */
  const { isWalletReady, getSigner, account } = useWeb3();
  const { toFiat, fNum } = useNumbers();
  const {
    tokens: allTokens,
    balances,
    balanceFor,
    getToken,
    dynamicDataLoading,
    nativeAsset,
  } = useTokens();
  const { replaceWethWithEth } = useTokenHelpers();
  const { minusSlippage, addSlippageScaled } = useSlippage();
  const { isWeightedPool, isShallowComposableStablePool } = usePoolHelper(pool);
  const {
    promises: swapPromises,
    processing: processingSwaps,
    processAll: processSwaps,
  } = usePromiseSequence();

  /**
   * SERVICES
   */
  const poolCalculator = new PoolCalculator(pool, allTokens, balances, 'exit');
  const poolExchange = new PoolExchange(pool);

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    return tokensListExclBpt(pool.value);
  });

  const tokenCount = computed((): number => tokenAddresses.value.length);

  // The tokens of the pool
  const poolTokens = computed((): TokenInfo[] =>
    tokensListExclBpt(pool.value).map(address => getToken(address))
  );

  const tokenOutDecimals = computed(
    (): number => getToken(tokenOut.value).decimals
  );

  const poolDecimals = computed(
    (): number => pool.value?.onchain?.decimals || 18
  );

  /**
   * The tokens being withdrawn
   * In most cases these are the same as the pool tokens
   * except for Stable Phantom pools
   */
  const withdrawalTokens = computed((): TokenInfo[] =>
    tokenAddresses.value.map(address => getToken(address))
  );

  const bptBalance = computed((): string => balanceFor(pool.value.address));

  const bptBalanceScaled = computed((): string =>
    parseUnits(bptBalance.value, poolDecimals.value).toString()
  );

  /**
   * Returns the absolute max BPT withdrawable from a pool.
   * In most cases this is just the user's BPT balance.
   *
   * However, for weighted pools, if the user is a majority LP they may
   * only be able to withdraw up to the 30% limit.
   */
  const absMaxBpt = computed((): string => {
    if (!isWeightedPool.value) return bptBalance.value;
    // Maximum BPT allowed from weighted pool is 30%
    const poolMax = bnum(pool.value.totalShares)
      .times(0.3)
      .toFixed(poolDecimals.value, OldBigNumber.ROUND_DOWN);
    // If the user's bpt balance is greater than the withdrawal limit for
    // weighted pools we need to return the poolMax bpt value.
    return OldBigNumber.min(bptBalance.value, poolMax).toString();
  });

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenOutPoolBalance = computed(() => {
    const tokens = pool.value?.onchain?.tokens || [];
    const balances = Object.values(tokens).map(token => token.balance);
    return balances[tokenOutIndex.value];
  });

  const amountExceedsPoolBalance = computed(() =>
    bnum(tokenOutAmount.value).gt(tokenOutPoolBalance.value)
  );

  // To account for exact maths required in BPTInForExactTokensOut cases.
  const shouldUseBptBuffer = computed(
    (): boolean =>
      isProportional.value &&
      isShallowComposableStablePool.value &&
      !pool.value.isInRecoveryMode
  );

  const bptBuffer = computed((): number =>
    shouldUseBptBuffer.value ? SHALLOW_COMPOSABLE_STABLE_BUFFER : 0
  );

  /**
   * Proportional pool token amounts out given BPT in.
   * Only relevant for exit calls, not batchSwap or batch relayer exits.
   */
  const proportionalPoolTokenAmounts = computed((): string[] => {
    let fixedRatioOverride;
    if (shouldUseBptBuffer.value && bnum(evmGuideBptIn.value).gt(0)) {
      fixedRatioOverride = {
        bps: 1000, // 10%
        value: evmGuideBptIn.value,
        buffer: bptBuffer.value,
      };
    }

    const { receive } = poolCalculator.propAmountsGiven(
      propBptIn.value,
      0,
      'send',
      fixedRatioOverride
    );

    return receive;
  });

  const proportionalAmounts = computed((): string[] => {
    return proportionalPoolTokenAmounts.value;
  });

  const fullAmounts = computed(() => {
    if (isProportional.value) return proportionalAmounts.value;

    return new Array(tokenCount.value).fill('0').map((_, i) => {
      return i === tokenOutIndex.value ? tokenOutAmount.value || '0' : '0';
    });
  });

  /**
   * The full input amounts array minus slippage,
   * if the amount is not 0 or a single asset exact out case.
   */
  const amountsOut = computed(() => {
    return fullAmounts.value.map((amount, i) => {
      if (amount === '0' || exactOut.value) return amount;
      if (
        isProportional.value &&
        isShallowComposableStablePool.value &&
        !pool.value.isInRecoveryMode
      )
        return amount;

      return minusSlippage(amount, withdrawalTokens.value[i].decimals);
    });
  });

  /**
   * The BPT value to be used for the withdrawal transaction without accounting for slippage.
   */
  const fullBPTIn = computed((): string => {
    if (isProportional.value) {
      const _bpt = bnum(propBptIn.value)
        .minus(formatUnits(bptBuffer.value), 18)
        .toString();
      return parseUnits(_bpt, poolDecimals.value).toString();
    }
    if (!exactOut.value)
      return parseUnits(absMaxBpt.value, poolDecimals.value).toString(); // Single asset max withdrawal

    // Else single asset exact out amount case
    if (isShallowComposableStablePool.value && !pool.value.isInRecoveryMode)
      return queryBptIn.value;

    return poolCalculator
      .bptInForExactTokenOut(tokenOutAmount.value, tokenOutIndex.value)
      .toString();
  });

  /**
   * The BPT value to be used for the withdrawal transaction accounting for slippage.
   * BPT value should be adjusted to account for slippage when:
   * - single asset exact out
   * - A shallow ComposableStable proportional exit (because we need to use BPTInForExactTokensOut)
   */
  const bptIn = computed((): string => {
    if (exactOut.value) return addSlippageScaled(fullBPTIn.value);
    if (
      isShallowComposableStablePool.value &&
      !pool.value.isInRecoveryMode &&
      !singleAssetMaxed.value
    ) {
      return addSlippageScaled(fullBPTIn.value);
    }

    return fullBPTIn.value.toString();
  });

  const hasAmounts = computed(() =>
    fullAmounts.value.some(amount => bnum(amount).gt(0))
  );

  const singleAssetMaxes = computed((): string[] => {
    if (isShallowComposableStablePool.value)
      return fetchedSingleAssetMaxes.value;

    try {
      return poolTokens.value.map((token, tokenIndex) => {
        return formatUnits(
          poolCalculator
            .exactBPTInForTokenOut(bptBalanceScaled.value, tokenIndex)
            .toString(),
          token.decimals
        );
      });
    } catch (error) {
      if ((error as Error).message.includes('MIN_BPT_IN_FOR_TOKEN_OUT')) {
        setError(WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT);
        return poolTokens.value.map((token, tokenIndex) => {
          return formatUnits(
            poolCalculator
              .exactBPTInForTokenOut(
                parseUnits(absMaxBpt.value, poolDecimals.value).toString(),
                tokenIndex
              )
              .toString(),
            token.decimals
          );
        });
      }
      return [];
    }
  });

  // Checks if the single asset withdrawal is maxed out.
  const singleAssetMaxed = computed(() => {
    return (
      singleAssetMaxes.value[tokenOutIndex.value] ===
      fullAmounts.value[tokenOutIndex.value]
    );
  });

  /**
   * Checks if exactOut case, where the user is requesting
   * a single asset withdrawal that is not maxed out.
   */
  const exactOut = computed(() => {
    return !isProportional.value && !singleAssetMaxed.value;
  });

  /**
   * Checks that the state of the form is a single asset withdrawal
   * and if the single asset is maxed out.
   */
  const singleAssetMaxOut = computed(
    () => !isProportional.value && singleAssetMaxed.value
  );

  const priceImpact = computed((): number => {
    if (amountExceedsPoolBalance.value) return 1;
    if (!hasAmounts.value || isProportional.value) return 0;

    return poolCalculator
      .priceImpact(fullAmounts.value, {
        exactOut: exactOut.value,
        tokenIndex: tokenOutIndex.value,
        queryBPT: fullBPTIn.value,
      })
      .toNumber();
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT)
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((amount, i) =>
      toFiat(amount, withdrawalTokens.value[i]?.address)
    )
  );

  const fiatTotal = computed((): string =>
    fiatAmounts.value.reduce(
      (total, amount) => bnum(total).plus(amount).toString(),
      '0'
    )
  );

  const fiatTotalLabel = computed((): string =>
    fNum(fiatTotal.value, FNumFormats.fiat)
  );

  /**
   * METHODS
   */
  async function initMath(): Promise<void> {
    await getBptOutGuide();
    propBptIn.value = bptBalance.value;
  }

  function resetMath(): void {
    initMath();
    tokenOutAmount.value = '';
  }

  // Fetch single asset max out for current tokenOut using batch swaps.
  // Set max out returned from batchSwap in state.
  async function getSingleAssetMaxOut(): Promise<void> {
    if (isShallowComposableStablePool.value) {
      const result = await poolExchange.queryExit(
        getSigner(),
        amountsOut.value.map(() => '0'),
        tokensOut.value,
        bptBalance.value,
        tokenOutIndex.value,
        false
      );
      let tokens = pool.value.tokens.map(t => t.address);
      if (isSameAddress(tokenOut.value, nativeAsset.address))
        tokens = replaceWethWithEth(tokens);
      const actualIndex = indexOfAddress(tokens, tokenOut.value);
      const maxOut = formatUnits(
        result.amountsOut[actualIndex].toString(),
        tokenOutDecimals.value
      );
      fetchedSingleAssetMaxes.value[tokenOutIndex.value] = maxOut;
    }
  }

  async function getQueryBptIn() {
    if (!isShallowComposableStablePool.value) return;

    const normalizedBptIn = bnum(bptBalance.value).plus(1).toString();

    try {
      loadingData.value = true;
      const result = await poolExchange.queryExit(
        getSigner(),
        amountsOut.value,
        tokensOut.value,
        normalizedBptIn,
        singleAssetMaxOut.value ? tokenOutIndex.value : null,
        exactOut.value
      );
      queryBptIn.value = result.bptIn.toString();
      loadingData.value = false;
    } catch (error) {
      console.error('Failed to fetch queryJoin', error);
    }
  }

  /**
   * Fetches BPT out given 10% of pool token balances in. This value can then be
   * used as a guide for proportional exits in the shallow ComposableStable case.
   */
  async function getBptOutGuide() {
    if (!isShallowComposableStablePool.value) return;

    loadingData.value = true;

    // Refetch onchain data for pool.
    const [_pool] = await new PoolDecorator([cloneDeep(pool.value)]).decorate(
      allTokens.value
    );

    const bptIn = _pool.onchain?.totalSupply || '0';
    const amountsOut = Object.values(_pool.onchain?.tokens || []).map(t =>
      formatUnits(
        parseUnits(t.balance, t.decimals).mul(1000).div(10000),
        t.decimals
      )
    );

    try {
      const result = await poolExchange.queryExit(
        getSigner(),
        amountsOut,
        tokensOut.value,
        bptIn,
        null,
        false
      );
      evmGuideBptIn.value = result.bptIn.toString();
      loadingData.value = false;
    } catch (error) {
      console.error('Failed to fetch queryExit', error);
    }
  }

  /**
   * WATCHERS
   */
  watch(tokenOut, () => {
    tokenOutAmount.value = '';
    if (isShallowComposableStablePool.value) getSingleAssetMaxOut();
  });

  watch(isProportional, () => {
    if (isShallowComposableStablePool.value) getSingleAssetMaxOut();
  });

  watch(isWalletReady, async () => {
    await forChange(dynamicDataLoading, false);
    initMath();
  });

  watch(account, () => initMath());

  watch(tokenOutAmount, async (newAmount, oldAmount) => {
    if (!isEqual(oldAmount, newAmount)) {
      /**
       * If a single asset exit and the input values change we
       * need to refetch the swap to get the required BPT in.
       */
      if (!isProportional.value) {
        swapPromises.value.push(getQueryBptIn);
        if (!processingSwaps.value) processSwaps();
      }
    }
  });

  return {
    // computed
    hasAmounts,
    fullAmounts,
    amountsOut,
    fiatAmounts,
    tokenOutAmount,
    propBptIn,
    bptIn,
    bptBalance,
    hasBpt,
    fiatTotalLabel,
    fiatTotal,
    priceImpact,
    highPriceImpact,
    proportionalAmounts,
    proportionalPoolTokenAmounts,
    singleAssetMaxes,
    exactOut,
    singleAssetMaxOut,
    tokenOutPoolBalance,
    loadingData,
    // methods
    initMath,
    resetMath,
  };
}
