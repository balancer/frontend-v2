import { computed, Ref, watch, ref } from 'vue';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
import useNumbers, { fNum } from '@/composables/useNumbers';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import useTokens from '@/composables/useTokens';
import { formatUnits } from '@ethersproject/units';
import useSlippage from '@/composables/useSlippage';
import { usePool } from '@/composables/usePool';
import useUserSettings from '@/composables/useUserSettings';

export type InvestMath = {
  // computed
  hasAmounts: Ref<boolean>;
  fullAmounts: Ref<string[]>;
  fiatTotal: Ref<string>;
  fiatTotalLabel: Ref<string>;
  priceImpact: Ref<number>;
  highPriceImpact: Ref<boolean>;
  maximized: Ref<boolean>;
  optimized: Ref<boolean>;
  propSuggestions: Ref<string[]>;
  bptOut: Ref<string>;
  hasZeroBalance: Ref<boolean>;
  hasNoBalances: Ref<boolean>;
  // methods
  maximizeAmounts: () => void;
  optimizeAmounts: () => void;
};

export default function useInvestFormMath(
  pool: Ref<FullPool>,
  amounts: Ref<string[]>
): InvestMath {
  /**
   * STATE
   */
  const propSuggestions = ref<string[]>([]);

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { tokens, balances, balanceFor } = useTokens();
  const { minusSlippage } = useSlippage();
  const { managedPoolWithTradingHalted } = usePool(pool);
  const { currency } = useUserSettings();

  /**
   * Services
   */
  const poolCalculator = new PoolCalculator(pool, tokens, balances, 'join');

  /**
   * COMPUTED
   */
  const tokenAddresses = computed(() => pool.value.tokenAddresses);
  const tokenCount = computed(() => tokenAddresses.value.length);

  // Input amounts can be null so fullAmounts returns amounts for all tokens
  // and zero if null.
  const fullAmounts = computed((): string[] =>
    new Array(tokenCount.value).fill('0').map((_, i) => amounts.value[i] || '0')
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

  const hasAmounts = computed(() => bnum(fiatTotal.value).gt(0));

  const priceImpact = computed((): number => {
    if (!hasAmounts.value) return 0;
    return poolCalculator.priceImpact(fullAmounts.value).toNumber() || 0;
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01)
  );

  const maximized = computed(() =>
    fullAmounts.value.every(
      (amount, i) => amount === balanceFor(tokenAddresses.value[i])
    )
  );

  const optimized = computed(() => {
    const { send } = poolCalculator.propMax();
    return fullAmounts.value.every((amount, i) => amount === send[i]);
  });

  const bptOut = computed(() => {
    let _bptOut = poolCalculator
      .exactTokensInForBPTOut(fullAmounts.value)
      .toString();
    _bptOut = formatUnits(_bptOut, pool.value.onchain.decimals);

    if (managedPoolWithTradingHalted.value) return _bptOut;
    return minusSlippage(_bptOut, pool.value.onchain.decimals);
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

  /**
   * METHODS
   */
  function tokenAmount(index: number): string {
    return fullAmounts.value[index] || '0';
  }

  function fiatAmount(index: number): string {
    return toFiat(tokenAmount(index), pool.value.tokenAddresses[index]);
  }

  function maximizeAmounts(): void {
    fullAmounts.value.forEach((_, i) => {
      amounts.value[i] = balanceFor(tokenAddresses.value[i]);
    });
  }

  function optimizeAmounts(): void {
    const { send } = poolCalculator.propMax();
    amounts.value = [...send];
  }

  watch(fullAmounts, (newAmounts, oldAmounts) => {
    const changedIndex = newAmounts.findIndex(
      (amount, i) => oldAmounts[i] !== amount
    );
    if (changedIndex >= 0) {
      const { send } = poolCalculator.propAmountsGiven(
        fullAmounts.value[changedIndex],
        changedIndex,
        'send'
      );
      propSuggestions.value = send;
    }
  });

  return {
    // computed
    hasAmounts,
    fullAmounts,
    fiatTotal,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    maximized,
    optimized,
    propSuggestions,
    bptOut,
    hasZeroBalance,
    hasNoBalances,
    // methods
    maximizeAmounts,
    optimizeAmounts
  };
}
