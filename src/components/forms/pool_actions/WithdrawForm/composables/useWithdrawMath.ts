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

export type WithdrawMathResponse = {
  // computed
  hasAmounts: Ref<boolean>;
  fullAmounts: Ref<string[]>;
  fiatAmounts: Ref<string[]>;
  bptIn: Ref<string>;
  bptBalance: Ref<string>;
  fiatTotal: Ref<string>;
  fiatTotalLabel: Ref<string>;
  priceImpact: Ref<number>;
  highPriceImpact: Ref<boolean>;
  maximized: Ref<boolean>;
  optimized: Ref<boolean>;
  proportionalAmounts: Ref<string[]>;
  proportionalMaxes: Ref<string[]>;
  hasZeroBalance: Ref<boolean>;
  hasNoBalances: Ref<boolean>;
  maxAmounts: Ref<string[]>;
  // methods
  maximizeAmounts: () => void;
  optimizeAmounts: () => void;
};

export default function useWithdrawMath(
  pool: Ref<FullPool>,
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  useNativeAsset: Ref<boolean>,
  isProportional: Ref<boolean>
): WithdrawMathResponse {
  /**
   * STATE
   */
  const proportionalAmounts = ref<string[]>([]);
  const bptIn = ref('');

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { tokens: allTokens, balances, balanceFor, getToken } = useTokens();
  const { minusSlippage } = useSlippage();
  const { managedPoolWithTradingHalted } = usePool(pool);
  const { currency } = useUserSettings();

  /**
   * Services
   */
  const poolCalculator = new PoolCalculator(
    pool,
    allTokens,
    balances,
    'exit',
    useNativeAsset
  );

  /**
   * COMPUTED
   */
  const tokenCount = computed(() => tokenAddresses.value.length);

  const tokens = computed(() =>
    tokenAddresses.value.map(address => getToken(address))
  );

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

  const bptBalance = computed(() => {
    return balanceFor(pool.value.address);
  });

  const singleAssetMaxes = computed((): string[] => {
    return tokens.value.map((token, tokenIndex) => {
      return formatUnits(
        poolCalculator
          .exactBPTInForTokenOut(bptBalance.value, tokenIndex)
          .toString(),
        token.decimals
      );
    });
  });

  const proportionalMaxes = computed((): string[] => {
    const { receive } = poolCalculator.propAmountsGiven(
      bptBalance.value,
      0,
      'send'
    );
    return receive;
  });

  const maxAmounts = computed((): string[] => {
    if (isProportional.value) return proportionalMaxes.value;
    return singleAssetMaxes.value;
  });

  const maximized = computed(() =>
    fullAmounts.value.every((amount, i) => amount === maxAmounts.value[i])
  );

  const optimized = computed(() => {
    const { send } = poolCalculator.propMax();
    return fullAmounts.value.every((amount, i) => amount === send[i]);
  });

  const poolTokenBalances = computed((): string[] =>
    tokenAddresses.value.map((_, i) => maxAmounts.value[i])
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
      amounts.value[i] = maxAmounts.value[i];
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
      console.log('Input amount', fullAmounts.value[changedIndex])
      if (isProportional.value) {
        if (
          fullAmounts.value[changedIndex] ===
          proportionalMaxes.value[changedIndex]
        ) {
          bptIn.value = bptBalance.value;
          amounts.value = [...proportionalMaxes.value];
          proportionalAmounts.value = [...proportionalMaxes.value];
        } else {
          const { send, receive } = poolCalculator.propAmountsGiven(
            fullAmounts.value[changedIndex],
            changedIndex,
            'receive'
          );
          console.log('BPT balance', bptBalance.value);
          console.log('send BPT', send);
          console.log('receive', receive);
          bptIn.value = send[0];
          amounts.value = [...receive];
          proportionalAmounts.value = [...receive];
        }
      } else {
        const { send, receive } = poolCalculator.propAmountsGiven(
          fullAmounts.value[changedIndex],
          changedIndex,
          'receive'
        );
        console.log('BPT balance', bptBalance.value);
        console.log('send BPT', send);
        console.log('receive', receive);
        proportionalAmounts.value = [...receive];
      }
    }
  });

  return {
    // computed
    hasAmounts,
    fullAmounts,
    fiatAmounts,
    bptIn,
    bptBalance,
    fiatTotal,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    maximized,
    optimized,
    proportionalAmounts,
    proportionalMaxes,
    hasZeroBalance,
    hasNoBalances,
    maxAmounts,
    // methods
    maximizeAmounts,
    optimizeAmounts
  };
}
