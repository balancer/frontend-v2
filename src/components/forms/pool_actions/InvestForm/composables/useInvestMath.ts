import { SOR, SwapInfo } from '@balancer-labs/sdk';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { computed, onMounted, Ref, ref, watch } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import usePromiseSequence from '@/composables/usePromiseSequence';
import useSlippage from '@/composables/useSlippage';
import useTokens from '@/composables/useTokens';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import { balancer } from '@/lib/balancer.sdk';
import { bnum, isSameAddress } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

export type InvestMathResponse = ReturnType<typeof useInvestMath>;

export default function useInvestMath(
  pool: Ref<Pool>,
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  useNativeAsset: Ref<boolean>
) {
  onMounted(() => {
    fetchPools();
  });

  /**
   * STATE
   */
  const proportionalAmounts = ref<string[]>([]);
  const swapRoute = ref<SwapInfo | null>(null);
  const swapRouteLoading = ref(false);
  const hasFetchedPools = ref(false);

  /**
   * COMPOSABLES
   */
  const { toFiat, fNum2 } = useNumbers();
  const { tokens, getToken, balances, balanceFor, nativeAsset } = useTokens();
  const { minusSlippageScaled } = useSlippage();
  const { managedPoolWithTradingHalted, isStablePhantomPool } = usePool(pool);
  const {
    promises: batchSwapPromises,
    processing: processingSwapRoute,
    processAll: processSwapRoute
  } = usePromiseSequence();
  const { getProvider } = useWeb3();

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
    return 0;
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
    if (swapRouteLoading.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  });

  const rektPriceImpact = computed((): boolean => {
    if (swapRouteLoading.value) return false;
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

    if (isStablePhantomPool.value) {
      _bptOut = swapRoute.value
        ? bnum(swapRoute.value.returnAmountFromSwaps.toString())
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

  const shouldFetchSwapRoute = computed(
    (): boolean => pool.value && isStablePhantomPool.value && hasAmounts.value
  );

  const supportsPropotionalOptimization = computed(
    (): boolean => !isStablePhantomPool.value
  );

  /**
   * METHODS
   */

  async function fetchPools() {
    hasFetchedPools.value = await balancer.swaps.fetchPools();
  }

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

  async function getSwapRoute(): Promise<void> {
    swapRouteLoading.value = true;
    if (!hasFetchedPools.value) {
      await fetchPools();
    }
    const gasPrice = await getProvider().getGasPrice();
    console.log({ gasPrice, clean: formatUnits(gasPrice, 'gwei') });
    if (!gasPrice) {
      swapRouteLoading.value = false;
      throw new Error('No gas price');
    }
    const route = await balancer.swaps.findRouteGivenIn({
      tokenIn: tokenAddresses.value[0],
      tokenOut: pool.value.address,
      amount: parseFixed(amounts.value[0], poolTokens.value[0].decimals),
      gasPrice,
      maxPools: 4
    });
    console.log({ route });
    const decimals = BigNumber.from(pool.value.onchain?.decimals || 18);
    console.log('clean', {
      returnAmount: formatFixed(route.returnAmount, decimals),
      returnAmountFromSwaps: formatFixed(route.returnAmountFromSwaps, decimals),
      returnAmountConsideringFees: formatFixed(
        route.returnAmountConsideringFees,
        decimals
      )
    });
    swapRoute.value = route;
    swapRouteLoading.value = false;
  }

  watch(fullAmounts, async (newAmounts, oldAmounts) => {
    const changedIndex = newAmounts.findIndex(
      (amount, i) => oldAmounts[i] !== amount
    );

    if (changedIndex >= 0) {
      if (shouldFetchSwapRoute.value) {
        batchSwapPromises.value.push(getSwapRoute);
        if (!processingSwapRoute.value) processSwapRoute();
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
    // state
    hasFetchedPools,
    swapRoute,
    swapRouteLoading,
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
    shouldFetchSwapRoute,
    supportsPropotionalOptimization,
    // methods
    maximizeAmounts,
    optimizeAmounts,
    getSwapRoute
  };
}
