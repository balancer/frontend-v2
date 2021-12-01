import { computed, Ref, ref, watch } from 'vue';
import { bnSum, bnum, forChange } from '@/lib/utils';
import { formatUnits, parseUnits } from '@ethersproject/units';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
// Services
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
// Composables
import useUserSettings from '@/composables/useUserSettings';
import useSlippage from '@/composables/useSlippage';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import { isStablePhantom, usePool } from '@/composables/usePool';
import { BatchSwapOut } from '@/types';
import { queryBatchSwapTokensOut, SOR } from '@balancer-labs/sor2';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { BigNumber } from 'ethers';
import OldBigNumber from 'bignumber.js';
import { TokenInfo } from '@/types/TokenList';
import { balancer } from '@/lib/balancer.sdk';
import { SwapType } from '@balancer-labs/sdk';
import { SwapKind } from '@balancer-labs/balancer-js';

/**
 * TYPES
 */
export type WithdrawMathResponse = {
  hasAmounts: Ref<boolean>;
  fullAmounts: Ref<string[]>;
  amountsOut: Ref<string[]>;
  fiatAmounts: Ref<string[]>;
  tokenOutAmount: Ref<string>;
  propBptIn: Ref<string>;
  bptIn: Ref<string>;
  bptBalance: Ref<string>;
  hasBpt: Ref<boolean>;
  fiatTotalLabel: Ref<string>;
  priceImpact: Ref<number>;
  highPriceImpact: Ref<boolean>;
  proportionalAmounts: Ref<string[]>;
  proportionalPoolTokenAmounts: Ref<string[]>;
  singleAssetMaxes: Ref<string[]>;
  exactOut: Ref<boolean>;
  singleAssetMaxOut: Ref<boolean>;
  tokenOutPoolBalance: Ref<string>;
  shouldFetchBatchSwap: Ref<boolean>;
  batchSwap: Ref<BatchSwapOut | null>;
  batchSwapAmountsOutMap: Ref<Record<string, BigNumber>>;
  batchSwapKind: Ref<SwapKind>;
  initMath: () => Promise<void>;
  resetMath: () => void;
  getBatchSwap: () => Promise<BatchSwapOut>;
};

export default function useWithdrawMath(
  pool: Ref<FullPool>,
  isProportional: Ref<boolean> = ref(true),
  tokenOut: Ref<string> = ref(''),
  tokenOutIndex: Ref<number> = ref(0)
): WithdrawMathResponse {
  /**
   * STATE
   */
  const propBptIn = ref('');
  const tokenOutAmount = ref('');
  const batchSwap = ref<BatchSwapOut | null>(null);
  const batchSwapLoading = ref(false);
  const batchSwapSingleAssetMaxes = ref<string[]>([]);

  /**
   * COMPOSABLES
   */
  const { isWalletReady, account } = useWeb3();
  const { toFiat, fNum } = useNumbers();
  const {
    tokens: allTokens,
    balances,
    balanceFor,
    getToken,
    dynamicDataLoading
  } = useTokens();
  const { minusSlippage, addSlippage, minusSlippageScaled } = useSlippage();
  const { currency } = useUserSettings();
  const { isStablePhantomPool } = usePool(pool);

  /**
   * SERVICES
   */
  const poolCalculator = new PoolCalculator(pool, allTokens, balances, 'exit');

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    if (isStablePhantom(pool.value.poolType)) {
      return pool.value.mainTokens || [];
    }
    return pool.value.tokenAddresses;
  });

  const tokenCount = computed((): number => tokenAddresses.value.length);

  // The tokens of the pool
  const poolTokens = computed((): TokenInfo[] =>
    pool.value.tokenAddresses.map(address => getToken(address))
  );

  const tokenOutDecimals = computed(
    (): number => getToken(tokenOut.value).decimals
  );

  /**
   * The tokens being withdrawn
   * In most cases these are the same as the pool tokens
   * except for Stable Phantom pools
   */
  const withdrawalTokens = computed((): TokenInfo[] =>
    tokenAddresses.value.map(address => getToken(address))
  );

  const bptBalance = computed(() => balanceFor(pool.value.address));
  const bptBalanceScaled = computed(() =>
    parseUnits(bptBalance.value, pool.value.onchain.decimals)
  );

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenOutPoolBalance = computed(() => {
    const balances = Object.values(pool.value.onchain.tokens).map(
      token => token.balance
    );
    return balances[tokenOutIndex.value];
  });

  const amountExceedsPoolBalance = computed(() =>
    bnum(tokenOutAmount.value).gt(tokenOutPoolBalance.value)
  );

  /**
   * Proportional pool token amounts out given BPT in.
   * Only relevant for exit calls, not batchSwap or batch relayer exits.
   */
  const proportionalPoolTokenAmounts = computed((): string[] => {
    const { receive } = poolCalculator.propAmountsGiven(
      propBptIn.value,
      0,
      'send'
    );
    return receive;
  });

  /**
   * Proportional amounts out for a StablePhantom pool's output tokens.
   * Derived from queryBatchSwap amounts out result.
   * Output tokens could be the mainTokens or unwrapped wrapped tokens.
   * e.g. USDC, USDT, DAI or aUSDC, aUSDT, aDAI
   */
  const proportionalMainTokenAmounts = computed((): string[] => {
    if (pool.value.onchain.linearPools && batchSwap.value) {
      return batchSwap.value.returnAmounts.map((amount, i) => {
        const _amount = bnum(amount.toString())
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    }
    return new Array(tokenCount.value).fill('0');
  });

  const proportionalAmounts = computed((): string[] => {
    if (isStablePhantomPool.value) {
      return proportionalMainTokenAmounts.value;
    }
    return proportionalPoolTokenAmounts.value;
  });

  const fullAmounts = computed(() => {
    if (isProportional.value) return proportionalAmounts.value;
    return new Array(tokenCount.value).fill('0').map((_, i) => {
      return i === tokenOutIndex.value ? tokenOutAmount.value || '0' : '0';
    });
  });

  const fullAmountsScaled = computed((): BigNumber[] =>
    fullAmounts.value.map((amount, i) =>
      parseUnits(amount, withdrawalTokens.value[i].decimals)
    )
  );

  /**
   * The full input amounts array minus slippage,
   * if the amount is not 0 or a single asset exact out case.
   */
  const amountsOut = computed(() => {
    return fullAmounts.value.map((amount, i) => {
      if (amount === '0' || exactOut.value) return amount;
      return minusSlippage(amount, withdrawalTokens.value[i].decimals);
    });
  });

  /**
   * The BPT value to be used for the withdrawal transaction.
   * Only in the single asset exact out case should the BPT value
   * be adjusted to account for slippage.
   */
  const bptIn = computed((): string => {
    if (isProportional.value) return propBptIn.value;
    if (!exactOut.value) return bptBalance.value; // Single asset max withdrawal

    if (exactOut.value && isStablePhantomPool.value) {
      if (!batchSwap.value) return '0';
      const _bptIn = formatUnits(
        batchSwap.value.returnAmounts[0],
        pool.value.onchain.decimals
      );
      return addSlippage(_bptIn, pool.value.onchain.decimals);
    }

    // Else single asset exact amount case
    let _bptIn = poolCalculator
      .bptInForExactTokenOut(tokenOutAmount.value, tokenOutIndex.value)
      .toString();

    _bptIn = formatUnits(_bptIn, pool.value.onchain.decimals);

    return addSlippage(_bptIn, pool.value.onchain.decimals);
  });

  const hasAmounts = computed(() =>
    fullAmounts.value.some(amount => bnum(amount).gt(0))
  );

  const singleAssetMaxes = computed((): string[] => {
    if (isStablePhantomPool.value) return batchSwapSingleAssetMaxes.value;

    return poolTokens.value.map((token, tokenIndex) => {
      return formatUnits(
        poolCalculator
          .exactBPTInForTokenOut(bptBalance.value, tokenIndex)
          .toString(),
        token.decimals
      );
    });
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

    // TODO - handle single asset withdrawal price impact for StablePhantom pools
    return poolCalculator
      .priceImpact(fullAmounts.value, {
        exactOut: exactOut.value,
        tokenIndex: tokenOutIndex.value
      })
      .toNumber();
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01)
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((amount, i) =>
      toFiat(amount, withdrawalTokens.value[i].address)
    )
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

  const shouldFetchBatchSwap = computed(
    (): boolean =>
      pool.value && isStablePhantomPool.value && bnum(bptIn.value).gt(0)
  );

  /**
   * TODO - figure out how to detect when to use batch relayer
   */
  const shouldUseBatchRelayer = computed((): boolean => {
    if (!isStablePhantomPool.value || !pool.value.onchain.linearPools)
      return false;
    // Need to get pool balances of Stables, e.g. Dai, USDC, USDT
    console.log('pool', pool.value);
    const poolStableBalances = Object.values(
      pool.value.onchain.linearPools
    ).map((linearPool, i) =>
      formatUnits(
        linearPool.mainToken.balance,
        withdrawalTokens.value[i].decimals
      )
    );
    console.log('poolStableBalances', poolStableBalances);
    // Then account balances in stables using BPT of linear pools and price rate
    const priceRates = Object.values(pool.value.onchain.linearPools).map(
      linearPool => linearPool.priceRate
    );
    console.log('priceRates', priceRates);
    console.log(
      'proportionalPoolTokenAmounts',
      proportionalPoolTokenAmounts.value
    );
    const accountStableBalances = proportionalPoolTokenAmounts.value.map(
      (amount, i) =>
        bnum(amount)
          .times(priceRates[i])
          .toFixed(withdrawalTokens.value[i].decimals, OldBigNumber.ROUND_UP)
    );
    console.log('accountStableBalances', accountStableBalances);

    // const diffs =

    // Then compare the two, if account balance is greater than pool balance, we need the relayer
    // caveat, if single asset we only need to compare that stable's balances
    // if proportional exit then we need to check all
    return false;
  });

  // Token amounts out to pass in to batch swap transaction and used as limits.
  const batchSwapAmountsOutMap = computed(
    (): Record<string, BigNumber> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts
        .filter(([, amount]) => (amount as BigNumber).gt(0))
        .map(([token, amount]) => {
          return [
            token,
            exactOut.value ? amount : minusSlippageScaled(amount as BigNumber)
          ];
        });
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  // An array of BPT values to be passed into the batch swap tx
  const batchSwapBPTIn = computed((): BigNumber[] => {
    if (singleAssetMaxOut.value) return [bptBalanceScaled.value];
    if (exactOut.value) {
      return batchSwap.value
        ? batchSwap.value.returnAmounts.map(amount =>
            BigNumber.from(amount.toString())
          )
        : [];
    }

    const poolTokenSum = bnSum(proportionalPoolTokenAmounts.value).toString();

    const fractionalBPTIn = proportionalPoolTokenAmounts.value
      .map(poolTokenAmount => {
        const fraction = bnum(poolTokenAmount).div(poolTokenSum);
        return fraction
          .times(bptIn.value)
          .toFixed(pool.value.onchain.decimals, OldBigNumber.ROUND_DOWN);
      })
      .filter(BPT => bnum(BPT).gt(0));

    return fractionalBPTIn.map(bptFraction =>
      parseUnits(bptFraction, pool.value.onchain.decimals)
    );
  });

  const batchSwapTokensOut = computed((): string[] => {
    if (singleAssetMaxOut.value) return [tokenOut.value];
    return tokenAddresses.value.map(address => address.toLowerCase());
  });

  const batchSwapKind = computed(
    (): SwapKind => (exactOut.value ? SwapKind.GivenOut : SwapKind.GivenIn)
  );

  /**
   * METHODS
   */
  async function initMath(): Promise<void> {
    propBptIn.value = bptBalance.value;
    if (shouldFetchBatchSwap.value) batchSwap.value = await getBatchSwap();
  }

  function resetMath(): void {
    initMath();
    tokenOutAmount.value = '';
  }

  /**
   * Given either BPT in or the exact tokens out, fetches batch swap
   * required, where return amounts are the opposite of amounts.
   * @param amounts either BPT in amounts or exact out amounts
   * @param tokensOut tokens to recieve
   * @param swapType defaults to exact in
   */
  async function getBatchSwap(
    amounts: BigNumber[] | null = null,
    tokensOut: string[] | null = null,
    swapType: SwapType = SwapType.SwapExactIn
  ): Promise<BatchSwapOut> {
    batchSwapLoading.value = true;

    amounts = amounts || batchSwapBPTIn.value;
    const tokensIn = amounts.map(() => pool.value.address);
    const fetchPools = !batchSwap.value; // Only needs to be fetched on first call

    const result = await balancer.swaps.queryBatchSwapWithSor({
      tokensIn: tokensIn,
      tokensOut: tokensOut || batchSwapTokensOut.value,
      swapType,
      amounts,
      fetchPools
    });

    console.log('batchSwap', batchSwap.value);
    batchSwapLoading.value = false;
    return result;
  }

  // Fetch single asset max out for current tokenOut using batch swaps.
  // Set max out returned from batchSwap in state.
  async function getSingleAssetMaxOut(): Promise<void> {
    const _batchSwap = await getBatchSwap(
      [bptBalanceScaled.value],
      [tokenOut.value]
    );
    const amountOutScaled = bnum(_batchSwap.returnAmounts[0].toString())
      .abs()
      .toString();
    const amountOut = formatUnits(amountOutScaled, tokenOutDecimals.value);
    batchSwapSingleAssetMaxes.value[tokenOutIndex.value] = amountOut;
  }

  /**
   * WATCHERS
   */
  watch(tokenOut, () => {
    tokenOutAmount.value = '';
    if (isStablePhantomPool.value) getSingleAssetMaxOut();
  });

  watch(isWalletReady, async () => {
    await forChange(dynamicDataLoading, false);
    initMath();
  });

  watch(account, () => initMath());

  watch(fullAmounts, async () => {
    shouldUseBatchRelayer.value;
    if (exactOut.value) {
      const amountsOut = fullAmountsScaled.value.filter(amount => amount.gt(0));
      batchSwap.value = await getBatchSwap(
        amountsOut,
        [tokenOut.value],
        SwapType.SwapExactOut
      );
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
    priceImpact,
    highPriceImpact,
    proportionalAmounts,
    proportionalPoolTokenAmounts,
    singleAssetMaxes,
    exactOut,
    singleAssetMaxOut,
    tokenOutPoolBalance,
    shouldFetchBatchSwap,
    batchSwap,
    batchSwapAmountsOutMap,
    batchSwapKind,
    // methods
    initMath,
    resetMath,
    getBatchSwap
  };
}
