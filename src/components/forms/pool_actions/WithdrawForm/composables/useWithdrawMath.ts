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
  initMath: () => void;
  resetMath: () => void;
  getBatchSwap: () => Promise<void>;
};

export default function useWithdrawMath(
  pool: Ref<FullPool>,
  isProportional: Ref<boolean> = ref(true),
  tokenOut: Ref<string> = ref(''),
  tokenOutIndex: Ref<number> = ref(0),
  sor: SOR
): WithdrawMathResponse {
  /**
   * STATE
   */
  const propBptIn = ref('');
  const tokenOutAmount = ref('');
  const batchSwap = ref<BatchSwapOut | null>(null);
  const batchSwapLoading = ref(false);

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

  /**
   * The tokens being withdrawn
   * In most cases these are the same as the pool tokens
   * except for Stable
   */
  const withdrawalTokens = computed((): TokenInfo[] =>
    tokenAddresses.value.map(address => getToken(address))
  );

  const bptBalance = computed(() => {
    return balanceFor(pool.value.address);
  });

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
      return batchSwap.value.amountTokensOut.map((amount, i) => {
        const _amount = bnum(amount)
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    }
    return [];
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
      return i === tokenOutIndex.value ? tokenOutAmount.value : '0';
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
  const bptIn = computed(() => {
    if (isProportional.value) return propBptIn.value;
    if (!exactOut.value) return bptBalance.value; // Single asset max withdrawal

    // Else single asset exact amount case
    let _bptIn = poolCalculator
      .bptInForExactTokenOut(tokenOutAmount.value, tokenOutIndex.value)
      .toString();

    _bptIn = formatUnits(_bptIn, pool.value.onchain.decimals);

    return addSlippage(_bptIn, pool.value.onchain.decimals);
  });

  const hasAmounts = computed(() => bnum(fiatTotal.value).gt(0));

  // TODO - this essentially returns maxes in BB-A-DAI, etc
  // Probably need to convert values to tokenOut with priceRate
  // But which price rate?
  const singleAssetMaxes = computed((): string[] => {
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
   * Token amounts out to pass in to batch swap transaction and used as limits.
   * TODO - needs to handle single asset exact out case where we shouldn't minus slippage
   */
  const batchSwapAmountsOutMap = computed(
    (): Record<string, BigNumber> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts
        .filter(([, amount]) => (amount as BigNumber).gt(0))
        .map(([token, amount]) => {
          return [token, minusSlippageScaled(amount as BigNumber)];
        });
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  /**
   * METHODS
   */
  function initMath(): void {
    propBptIn.value = bptBalance.value;
    if (shouldFetchBatchSwap.value) getBatchSwap();
  }

  function resetMath(): void {
    initMath();
    tokenOutAmount.value = '';
  }

  /**
   * TESTING
   */

  // Assumes proportional exit
  // TODO - adjust for single asset case
  // For single asset exact out case we need a new query batch swap function
  // That takes amounts out and returns bptIn.
  const batchSwapBPTIn = computed((): BigNumber[] => {
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

  /**
   * END TESTING
   */

  async function getBatchSwap(): Promise<void> {
    batchSwapLoading.value = true;
    // Currently assumes proportional exit
    batchSwap.value = await queryBatchSwapTokensOut(
      sor,
      balancerContractsService.vault.instance,
      pool.value.address.toLowerCase(),
      batchSwapBPTIn.value,
      tokenAddresses.value.map(address => address.toLowerCase())
    );
    console.log('batchSwap', batchSwap.value);
    batchSwapLoading.value = false;
  }

  /**
   * WATCHERS
   */
  watch(tokenOut, () => (tokenOutAmount.value = ''));

  watch(isWalletReady, async () => {
    await forChange(dynamicDataLoading, false);
    initMath();
  });

  watch(account, () => initMath());

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
    // methods
    initMath,
    resetMath,
    getBatchSwap
  };
}
