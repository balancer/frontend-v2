import { computed, Ref, ref, watch } from 'vue';
import { bnum, forChange } from '@/lib/utils';
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
  const {
    minusSlippage,
    addSlippage,
    minusSlippageScaled,
    addSlippageScaled
  } = useSlippage();
  const { currency } = useUserSettings();
  const { isStablePhantomPool } = usePool(pool);

  /**
   * Services
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

  const poolTokens = computed(() =>
    pool.value.tokenAddresses.map(address => getToken(address))
  );

  const withdrawalTokens = computed(() =>
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
   * Proportional amounts out for a StablePhantom pool's output tokens
   * Derived from queryBatchSwap amounts out.
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

  const amountsOut = computed(() => {
    return fullAmounts.value.map((amount, i) => {
      if (amount === '0' || exactOut.value) return amount;
      return minusSlippage(amount, withdrawalTokens.value[i].decimals);
    });
  });

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

  const singleAssetMaxed = computed(() => {
    return (
      singleAssetMaxes.value[tokenOutIndex.value] ===
      fullAmounts.value[tokenOutIndex.value]
    );
  });

  const exactOut = computed(() => {
    return !isProportional.value && !singleAssetMaxed.value;
  });

  const singleAssetMaxOut = computed(
    () => !isProportional.value && singleAssetMaxed.value
  );

  const priceImpact = computed((): number => {
    if (amountExceedsPoolBalance.value) return 1;
    if (!hasAmounts.value || isProportional.value) return 0;

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
  const batchSwapAmountsOutMap = computed(
    (): Record<string, BigNumber> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      let onlyTokensWithAmounts = allTokensWithAmounts.filter(([, amount]) =>
        (amount as BigNumber).gt(0)
      );
      onlyTokensWithAmounts = onlyTokensWithAmounts.map(([token, amount]) => {
        return [token, minusSlippageScaled(amount as BigNumber)];
      });
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  // Assumes proportional exit
  const batchSwapAmountsIn = computed(() => {
    const poolTokenSum = proportionalPoolTokenAmounts.value.reduce(
      (a, b) =>
        bnum(a)
          .plus(b)
          .toString(),
      '0'
    );
    const amountsIn = proportionalPoolTokenAmounts.value
      .map(amount => {
        const fraction = bnum(amount).div(poolTokenSum);
        return fraction
          .times(bptIn.value)
          .toFixed(pool.value.onchain.decimals, OldBigNumber.ROUND_DOWN);
      })
      .filter(amount => bnum(amount).gt(0));
    return amountsIn.map(amount =>
      parseUnits(amount, pool.value.onchain.decimals)
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
      batchSwapAmountsIn.value,
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
