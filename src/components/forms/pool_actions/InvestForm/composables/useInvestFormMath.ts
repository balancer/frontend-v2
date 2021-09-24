import { computed, Ref } from 'vue';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
import useNumbers from '@/composables/useNumbers';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import useTokens from '@/composables/useTokens';

export default function useInvestFormMath(
  pool: Ref<FullPool>,
  amounts: Ref<string[]>
) {
  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { tokens, balances, balanceFor } = useTokens();

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

  const hasAmounts = computed(() => bnum(fiatTotal.value).gt(0));

  const priceImpact = computed((): number => {
    if (!hasAmounts.value) return 0;
    return poolCalculator.priceImpact(fullAmounts.value).toNumber() || 0;
  });

  const highPriceImpact = computed(() => bnum(priceImpact.value).gt(0.01));

  const maximized = computed(() =>
    fullAmounts.value.every(
      (amount, i) => amount === balanceFor(tokenAddresses.value[i])
    )
  );

  const optimized = computed(() => {
    const { send } = poolCalculator.propMax();
    return fullAmounts.value.every((amount, i) => amount === send[i]);
  });

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

  return {
    // computed
    fiatTotal,
    priceImpact,
    highPriceImpact,
    maximized,
    optimized,
    // methods
    maximizeAmounts,
    optimizeAmounts
  };
}
