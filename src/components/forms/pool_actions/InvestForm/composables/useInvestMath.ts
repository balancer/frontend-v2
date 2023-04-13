import { logFetchException } from '@/lib/utils/exceptions';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { computed, Ref, ref, watch } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePoolHelpers';
import useSlippage from '@/composables/useSlippage';
import { useTokens } from '@/providers/tokens.provider';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import { bnum, isSameAddress } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import useWeb3 from '@/services/web3/useWeb3';
import { captureException } from '@sentry/browser';

export type InvestMathResponse = ReturnType<typeof useInvestMath>;

export default function useInvestMath(
  pool: Ref<Pool>,
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  useNativeAsset: Ref<boolean>
) {
  /**
   * STATE
   */
  const proportionalAmounts = ref<string[]>([]);
  const loadingData = ref(false);
  const queryBptOut = ref<string>('0');

  /**
   * COMPOSABLES
   */
  const { toFiat, fNum } = useNumbers();
  const { tokens, getToken, balances, balanceFor, nativeAsset } = useTokens();
  const { minusSlippageScaled } = useSlippage();
  const { getSigner } = useWeb3();
  const {
    managedPoolWithSwappingHalted,
    isComposableStableLikePool,
    isShallowComposableStablePool,
  } = usePool(pool);

  /**
   * Services
   */
  const poolCalculator = new PoolCalculator(
    pool,
    tokens,
    balances,
    'join',
    useNativeAsset
  );
  const poolExchange = new PoolExchange(pool);

  /**
   * COMPUTED
   */
  const tokenCount = computed(() => tokenAddresses.value.length);

  const poolTokens = computed((): TokenInfo[] =>
    tokenAddresses.value.map(address => getToken(address))
  );

  // Input amounts can be null so fullAmounts returns amounts for all tokens
  // and zero if null.
  const fullAmounts = computed((): string[] =>
    new Array(tokenCount.value).fill('0').map((_, i) => amounts.value[i] || '0')
  );

  const fullAmountsScaled = computed((): BigNumber[] =>
    fullAmounts.value.map((amount, i) =>
      parseUnits(amount, poolTokens.value[i].decimals)
    )
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((_, i) => fiatAmount(i))
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

  const hasAmounts = computed(() =>
    fullAmounts.value.some(amount => bnum(amount).gt(0))
  );

  const priceImpact = computed((): number => {
    if (!hasAmounts.value) return 0;
    try {
      return (
        poolCalculator
          .priceImpact(fullAmounts.value, {
            queryBPT: fullBPTOut.value.toString(),
          })
          .toNumber() || 0
      );
    } catch (error) {
      captureException(error);
      console.error(error);
      return 1;
    }
  });

  const highPriceImpact = computed((): boolean => {
    if (loadingData.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  });

  const rektPriceImpact = computed((): boolean => {
    if (loadingData.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT);
  });

  const maximized = computed(() =>
    fullAmounts.value.every((amount, i) => {
      if (isSameAddress(tokenAddresses.value[i], nativeAsset.address)) {
        const balance = balanceFor(tokenAddresses.value[i]);
        return (
          amount ===
          bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
        );
      } else {
        return amount === balanceFor(tokenAddresses.value[i]);
      }
    })
  );

  const optimized = computed(() => {
    const { send } = poolCalculator.propMax();
    return fullAmounts.value.every((amount, i) => amount === send[i]);
  });

  const fullBPTOut = computed((): string => {
    let _bptOut: string;

    if (isShallowComposableStablePool.value && bnum(queryBptOut.value).gt(0)) {
      _bptOut = queryBptOut.value;
    } else {
      if (!hasAmounts.value) return '0';
      _bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
    }

    return _bptOut;
  });

  const bptOut = computed((): string => {
    if (managedPoolWithSwappingHalted.value) return fullBPTOut.value.toString();
    return minusSlippageScaled(fullBPTOut.value);
  });

  const poolTokenBalances = computed((): string[] =>
    tokenAddresses.value.map(token => balanceFor(token))
  );

  const hasZeroBalance = computed((): boolean =>
    poolTokenBalances.value.map(balance => bnum(balance).eq(0)).includes(true)
  );

  const hasNoBalances = computed((): boolean =>
    poolTokenBalances.value.every(balance => bnum(balance).eq(0))
  );

  const hasAllTokens = computed((): boolean =>
    poolTokenBalances.value.every(balance => bnum(balance).gt(0))
  );

  const supportsPropotionalOptimization = computed(
    (): boolean => !isComposableStableLikePool.value
  );

  /**
   * METHODS
   */
  function tokenAmount(index: number): string {
    return fullAmounts.value[index] || '0';
  }

  function fiatAmount(index: number): string {
    return toFiat(tokenAmount(index), tokenAddresses.value[index]);
  }

  function maximizeAmounts(): void {
    fullAmounts.value.forEach((_, i) => {
      if (isSameAddress(tokenAddresses.value[i], nativeAsset.address)) {
        const balance = balanceFor(tokenAddresses.value[i]);
        amounts.value[i] = bnum(balance).gt(nativeAsset.minTransactionBuffer)
          ? bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
          : '0';
      } else {
        amounts.value[i] = balanceFor(tokenAddresses.value[i]);
      }
    });
  }

  function optimizeAmounts(): void {
    const { send } = poolCalculator.propMax();
    amounts.value = [...send];
  }

  /**
   * Fetches expected BPT out using queryJoin and overrides bptOut value derived
   * from JS maths. Only used shallow ComposableStable pools due to issue with
   * cached priceRates.
   *
   * Note: This was originally seen with BAL#208 failures on join calls of the
   * Polygon MaticX pool.
   */
  async function getQueryBptOut() {
    if (!isShallowComposableStablePool.value) return;
    if (!hasAmounts.value) return;

    try {
      loadingData.value = true;
      const result = await poolExchange.queryJoin(
        getSigner(),
        fullAmounts.value,
        tokenAddresses.value,
        '0'
      );

      queryBptOut.value = result.bptOut.toString();
      loadingData.value = false;
    } catch (error) {
      logFetchException('Failed to fetch query bptOut', error);
    }
  }

  /**
   * WATCHERS
   */
  watch(fullAmounts, async (newAmounts, oldAmounts) => {
    const changedIndex = newAmounts.findIndex(
      (amount, i) => oldAmounts[i] !== amount
    );

    if (changedIndex >= 0) {
      await getQueryBptOut();

      const { send } = poolCalculator.propAmountsGiven(
        fullAmounts.value[changedIndex],
        changedIndex,
        'send'
      );
      proportionalAmounts.value = send;
    }
  });

  return {
    // computed
    hasAmounts,
    fullAmounts,
    fullAmountsScaled,
    fiatTotal,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    rektPriceImpact,
    maximized,
    optimized,
    proportionalAmounts,
    bptOut,
    hasZeroBalance,
    hasNoBalances,
    hasAllTokens,
    loadingData,
    supportsPropotionalOptimization,
    // methods
    maximizeAmounts,
    optimizeAmounts,
  };
}
