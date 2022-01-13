import { computed, ref, Ref } from 'vue';
import { parseUnits } from 'ethers/lib/utils';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';

import { FullPool } from '@/services/balancer/subgraph/types';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

import { bnSum, bnum } from '@/lib/utils';
import useSlippage from '@/composables/useSlippage';

export default function useMigrateFormMath(
  fromPool: Ref<FullPool>,
  toPool: Ref<FullPool>
) {
  /**
   * COMPOSABLES
   */
  const { tokens, balances, balanceFor, getToken } = useTokens();
  const { currency } = useUserSettings();
  const { fNum, toFiat } = useNumbers();
  const { minusSlippageScaled } = useSlippage();

  /**
   * SERVICES
   */
  const fromPoolCalculator = new PoolCalculator(
    fromPool,
    tokens,
    balances,
    'exit',
    ref(false)
  );

  const toPoolCalculator = new PoolCalculator(
    toPool,
    tokens,
    balances,
    'join',
    ref(false)
  );
  /**
   * COMPUTED
   */

  const bptBalance = computed(() => balanceFor(fromPool.value.address));

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenCount = computed(() => fromPool.value.tokenAddresses.length);

  const poolDecimals = computed(() => fromPool.value.onchain.decimals);

  const bptBalanceScaled = computed(() =>
    parseUnits(bptBalance.value, poolDecimals.value).toString()
  );

  const withdrawalTokens = computed(() =>
    fromPool.value.tokenAddresses.map(address => getToken(address))
  );

  const fullAmounts = computed(() => {
    const { receive } = fromPoolCalculator.propAmountsGiven(
      bptBalance.value,
      0,
      'send'
    );
    return receive;
  });

  const fullAmountsScaled = computed((): string[] =>
    fullAmounts.value.map((amount, i) =>
      parseUnits(amount, withdrawalTokens.value[i].decimals).toString()
    )
  );

  const swapAmountsOut = computed(() =>
    fullAmountsScaled.value.map(minusSlippageScaled)
  );

  const fiatAmounts = computed((): string[] =>
    fromPool.value.tokenAddresses.map((address, i) =>
      toFiat(fullAmounts.value[i], address)
    )
  );

  const fiatTotal = computed(() => bnSum(fiatAmounts.value).toString());

  const fiatTotalLabel = computed(() => fNum(fiatTotal.value, currency.value));

  const fullBPTOut = computed(() =>
    fromPoolCalculator.exactTokensInForBPTOut(fullAmounts.value).toString()
  );

  const priceImpact = computed(() => {
    return toPoolCalculator
      .priceImpact(fullAmounts.value, {
        queryBPT: fullBPTOut.value
      })
      .toNumber();
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01)
  );

  return {
    // computed
    bptBalance,
    bptBalanceScaled,
    hasBpt,
    fullAmounts,
    fullAmountsScaled,
    tokenCount,
    fiatTotal,
    fiatTotalLabel,
    swapAmountsOut,
    priceImpact,
    highPriceImpact
  };
}
