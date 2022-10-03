import { queryBatchSwapTokensIn, SOR } from '@balancer-labs/sdk';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { computed, Ref, ref, watch } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import usePromiseSequence from '@/composables/usePromiseSequence';
import useSlippage from '@/composables/useSlippage';
import useTokens from '@/composables/useTokens';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import { bnum, isSameAddress } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import { BatchSwap } from '@/types';
import { TokenInfo } from '@/types/TokenList';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import useWeb3 from '@/services/web3/useWeb3';

export type InvestMathResponse = ReturnType<typeof useInvestMath>;

export default function useInvestMath(
  pool: Ref<Pool>,
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  useNativeAsset: Ref<boolean>,
  sor: SOR
) {
  /**
   * STATE
   */
  const proportionalAmounts = ref<string[]>([]);
  const loadingData = ref(false);
  const batchSwap = ref<BatchSwap | null>(null);
  const queryBptOut = ref<string>('0');

  /**
   * COMPOSABLES
   */
  const { toFiat, fNum2 } = useNumbers();
  const { tokens, getToken, balances, balanceFor, nativeAsset } = useTokens();
  const { minusSlippageScaled } = useSlippage();
  const { getProvider, account } = useWeb3();
  const {
    managedPoolWithTradingHalted,
    isComposableStableLikePool,
    isShallowComposableStablePool,
    isDeepPool,
  } = usePool(pool);
  const {
    promises: batchSwapPromises,
    processing: processingBatchSwaps,
    processAll: processBatchSwaps,
  } = usePromiseSequence();

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

  const batchSwapAmountMap = computed((): Record<string, BigNumber> => {
    const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
      tokenAddresses.value[i].toLowerCase(),
      amount,
    ]);
    const onlyTokensWithAmounts = allTokensWithAmounts.filter(([, amount]) =>
      (amount as BigNumber).gt(0)
    );
    return Object.fromEntries(onlyTokensWithAmounts);
  });

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
    fNum2(fiatTotal.value, FNumFormats.fiat)
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

    if (isDeepPool.value) {
      _bptOut = batchSwap.value
        ? bnum(batchSwap.value.amountTokenOut).abs().toString()
        : '0';
    } else if (
      isShallowComposableStablePool.value &&
      bnum(queryBptOut.value).gt(0)
    ) {
      _bptOut = queryBptOut.value;
    } else {
      _bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
    }

    return _bptOut;
  });

  const bptOut = computed((): string => {
    if (managedPoolWithTradingHalted.value) return fullBPTOut.value.toString();
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

  const shouldFetchBatchSwap = computed(
    (): boolean => pool.value && isDeepPool.value && hasAmounts.value
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

  async function getBatchSwap(): Promise<void> {
    loadingData.value = true;
    batchSwap.value = await queryBatchSwapTokensIn(
      sor,
      balancerContractsService.vault.instance as any,
      Object.keys(batchSwapAmountMap.value),
      Object.values(batchSwapAmountMap.value),
      pool.value.address.toLowerCase()
    );

    loadingData.value = false;
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

    try {
      loadingData.value = true;
      const result = await poolExchange.queryJoin(
        getProvider(),
        account.value,
        fullAmounts.value,
        tokenAddresses.value,
        '0'
      );

      queryBptOut.value = result.bptOut.toString();
      loadingData.value = false;
    } catch (error) {
      console.error('Failed to fetch query bptOut', error);
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

      if (shouldFetchBatchSwap.value) {
        batchSwapPromises.value.push(getBatchSwap);
        if (!processingBatchSwaps.value) processBatchSwaps();
      }

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
    batchSwapAmountMap,
    fiatTotal,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    rektPriceImpact,
    maximized,
    optimized,
    proportionalAmounts,
    batchSwap,
    bptOut,
    hasZeroBalance,
    hasNoBalances,
    hasAllTokens,
    shouldFetchBatchSwap,
    loadingData,
    supportsPropotionalOptimization,
    // methods
    maximizeAmounts,
    optimizeAmounts,
    getBatchSwap,
  };
}
