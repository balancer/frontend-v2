import { computed, ref, Ref } from 'vue';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { usePool } from '@/composables/usePool';

import { FullPool } from '@/services/balancer/subgraph/types';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

import { bnSum, bnum } from '@/lib/utils';

import { balancer } from '@/lib/balancer.sdk';

import { queryBatchSwapTokensIn } from '@balancer-labs/sdk';

import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';

import { BatchSwap } from '@/types';

export type MigrateMathResponse = ReturnType<typeof useMigrateMath>;

export default function useMigrateMath(
  fromPool: Ref<FullPool>,
  toPool: Ref<FullPool>
) {
  /**
   * COMPOSABLES
   */
  const { tokens, balances, balanceFor, getToken } = useTokens();
  const { fNum2, toFiat } = useNumbers();
  const toPoolTypes = usePool(toPool);

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
   * STATE
   */
  const batchSwap = ref<BatchSwap | null>(null);
  const batchSwapLoading = ref(false);
  const bptBalance = ref(balanceFor(fromPool.value.address));

  /**
   * COMPUTED
   */

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenCount = computed(() => fromPool.value.tokenAddresses.length);

  const poolDecimals = computed(() => fromPool.value.onchain.decimals);

  const batchSwapLoaded = computed(() => batchSwap.value != null);

  const bptBalanceScaled = computed(() =>
    parseUnits(bptBalance.value, poolDecimals.value).toString()
  );

  const shouldFetchBatchSwap = computed(
    () => toPoolTypes.isStablePhantomPool.value
  );

  const poolTokens = computed(() =>
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

  const fullAmountsScaled = computed(() =>
    fullAmounts.value.map((amount, i) =>
      parseUnits(amount, poolTokens.value[i].decimals)
    )
  );

  const fullBPTOut = computed((): string => {
    let _bptOut: string;

    if (toPoolTypes.isStablePhantomPool.value) {
      _bptOut = batchSwap.value
        ? bnum(batchSwap.value.amountTokenOut)
            .abs()
            .toString()
        : '0';
    } else {
      _bptOut = toPoolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
    }

    console.log('query BPT', _bptOut.toString());

    return _bptOut;
  });

  const priceImpact = computed((): number => {
    // TODO: When from/to pool token count is different its not possible to calculate the price impact.
    if (fromPool.value.tokensList.length !== toPool.value.tokensList.length) {
      return 0;
    }
    try {
      return (
        toPoolCalculator
          .priceImpact(fullAmounts.value, {
            queryBPT: fullBPTOut.value.toString()
          })
          .toNumber() || 0
      );
    } catch (error) {
      return 1;
    }
  });

  const highPriceImpact = computed(() => {
    if (!batchSwapLoaded.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01);
  });

  const batchSwapAmountMap = computed(
    (): Record<string, BigNumber> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        fromPool.value.tokenAddresses[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts.filter(([, amount]) =>
        (amount as BigNumber).gt(0)
      );
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  const fiatAmounts = computed((): string[] =>
    fromPool.value.tokenAddresses.map((address, i) =>
      toFiat(fullAmounts.value[i], address)
    )
  );

  const fiatTotal = computed(() => bnSum(fiatAmounts.value).toString());

  const fiatTotalLabel = computed(() =>
    fNum2(fiatTotal.value, FNumFormats.fiat)
  );

  /**
   * METHODS
   */
  async function getBatchSwap(): Promise<void> {
    batchSwapLoading.value = true;

    if (!batchSwapLoaded.value) {
      await balancer.sor.fetchPools();
    }

    batchSwap.value = await queryBatchSwapTokensIn(
      balancer.sor,
      balancerContractsService.vault.instance as any,
      Object.keys(batchSwapAmountMap.value),
      Object.values(batchSwapAmountMap.value),
      toPool.value.address.toLowerCase()
    );

    batchSwapLoading.value = false;
  }

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
    priceImpact,
    shouldFetchBatchSwap,
    batchSwapLoading,
    batchSwapLoaded,
    highPriceImpact,
    // methods
    getBatchSwap
  };
}
