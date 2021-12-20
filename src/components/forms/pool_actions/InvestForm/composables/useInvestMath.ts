import { computed, Ref, watch, ref } from 'vue';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
import useNumbers, { fNum } from '@/composables/useNumbers';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import useTokens from '@/composables/useTokens';
import { parseUnits } from '@ethersproject/units';
import useSlippage from '@/composables/useSlippage';
import { usePool } from '@/composables/usePool';
import useUserSettings from '@/composables/useUserSettings';
import { BigNumber } from 'ethers';
import { TokenInfo } from '@/types/TokenList';
import { queryBatchSwapTokensIn, SOR } from '@balancer-labs/sor2';
import { BatchSwap } from '@/types';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import usePromiseSequence from '@/composables/usePromiseSequence';

export type InvestMathResponse = {
  // computed
  hasAmounts: Ref<boolean>;
  fullAmounts: Ref<string[]>;
  fullAmountsScaled: Ref<BigNumber[]>;
  batchSwapAmountMap: Ref<Record<string, BigNumber>>;
  fiatTotal: Ref<string>;
  fiatTotalLabel: Ref<string>;
  priceImpact: Ref<number>;
  highPriceImpact: Ref<boolean>;
  maximized: Ref<boolean>;
  optimized: Ref<boolean>;
  proportionalAmounts: Ref<string[]>;
  batchSwap: Ref<BatchSwap | null>;
  bptOut: Ref<string>;
  hasZeroBalance: Ref<boolean>;
  hasNoBalances: Ref<boolean>;
  hasAllTokens: Ref<boolean>;
  shouldFetchBatchSwap: Ref<boolean>;
  batchSwapLoading: Ref<boolean>;
  supportsPropotionalOptimization: Ref<boolean>;
  // methods
  maximizeAmounts: () => void;
  optimizeAmounts: () => void;
  getBatchSwap: () => Promise<void>;
};

export default function useInvestFormMath(
  pool: Ref<FullPool>,
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  useNativeAsset: Ref<boolean>,
  sor: SOR
): InvestMathResponse {
  /**
   * STATE
   */
  const proportionalAmounts = ref<string[]>([]);
  const batchSwap = ref<BatchSwap | null>(null);
  const batchSwapLoading = ref(false);

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { tokens, getToken, balances, balanceFor, nativeAsset } = useTokens();
  const { minusSlippageScaled } = useSlippage();
  const { managedPoolWithTradingHalted, isStablePhantomPool } = usePool(pool);
  const { currency } = useUserSettings();
  const {
    promises: batchSwapPromises,
    processing: processingBatchSwaps,
    processAll: processBatchSwaps
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

  const batchSwapAmountMap = computed(
    (): Record<string, BigNumber> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts.filter(([, amount]) =>
        (amount as BigNumber).gt(0)
      );
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((_, i) => fiatAmount(i))
  );

  const fiatTotal = computed((): string =>
    fiatAmounts.value.reduce(
      (total, amount) =>
        bnum(total)
          .plus(amount)
          .toString(),
      '0'
    )
  );

  const fiatTotalLabel = computed((): string =>
    fNum(fiatTotal.value, currency.value)
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
            queryBPT: fullBPTOut.value.toString()
          })
          .toNumber() || 0
      );
    } catch (error) {
      return 1;
    }
  });

  const highPriceImpact = computed((): boolean => {
    if (batchSwapLoading.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01);
  });

  const maximized = computed(() =>
    fullAmounts.value.every((amount, i) => {
      if (tokenAddresses.value[i] === nativeAsset.address) {
        const balance = balanceFor(tokenAddresses.value[i]);
        return (
          amount ===
          bnum(balance)
            .minus(nativeAsset.minTransactionBuffer)
            .toString()
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

    if (isStablePhantomPool.value) {
      _bptOut = batchSwap.value
        ? bnum(batchSwap.value.amountTokenOut)
            .abs()
            .toString()
        : '0';
    } else {
      _bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
    }

    console.log('query BPT', _bptOut.toString());

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
    (): boolean => pool.value && isStablePhantomPool.value && hasAmounts.value
  );

  const supportsPropotionalOptimization = computed(
    (): boolean => !isStablePhantomPool.value
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
      if (tokenAddresses.value[i] === nativeAsset.address) {
        const balance = balanceFor(tokenAddresses.value[i]);
        amounts.value[i] = bnum(balance).gt(nativeAsset.minTransactionBuffer)
          ? bnum(balance)
              .minus(nativeAsset.minTransactionBuffer)
              .toString()
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
    batchSwapLoading.value = true;
    batchSwap.value = await queryBatchSwapTokensIn(
      sor,
      balancerContractsService.vault.instance as any,
      Object.keys(batchSwapAmountMap.value),
      Object.values(batchSwapAmountMap.value),
      pool.value.address.toLowerCase()
    );
    batchSwapLoading.value = false;
  }

  watch(fullAmounts, async (newAmounts, oldAmounts) => {
    const changedIndex = newAmounts.findIndex(
      (amount, i) => oldAmounts[i] !== amount
    );

    if (changedIndex >= 0) {
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
    maximized,
    optimized,
    proportionalAmounts,
    batchSwap,
    bptOut,
    hasZeroBalance,
    hasNoBalances,
    hasAllTokens,
    shouldFetchBatchSwap,
    batchSwapLoading,
    supportsPropotionalOptimization,
    // methods
    maximizeAmounts,
    optimizeAmounts,
    getBatchSwap
  };
}
