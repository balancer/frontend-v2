/**
 * useWithdrawMath
 *
 * Returns state, computed properties and methods for the withdraw form math.
 *
 * TODO:
 * Requires major refactor following Boosted pools (StablePhantom) logic additions.
 */
import { computed, Ref, ref, watch } from 'vue';
import { bnSum, bnum, forChange, scaleDown } from '@/lib/utils';
import { formatUnits, parseUnits } from '@ethersproject/units';
// Types
import { FullPool, PoolToken } from '@/services/balancer/subgraph/types';
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
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import OldBigNumber from 'bignumber.js';
import BigNumber from 'bignumber.js';
import { TokenInfo } from '@/types/TokenList';
import { balancer } from '@/lib/balancer.sdk';
import {
  SwapType,
  TransactionData,
  WeightedPoolEncoder
} from '@balancer-labs/sdk';
import { SwapKind } from '@balancer-labs/balancer-js';
import usePromiseSequence from '@/composables/usePromiseSequence';
import { getAddress } from '@ethersproject/address';
import { configService } from '@/services/config/config.service';
import { isEqual } from 'lodash';
import useConfig from '@/composables/useConfig';

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
  shouldFetchExitBatchSwap: Ref<boolean>;
  batchSwap: Ref<BatchSwapOut | null>;
  batchSwapAmountsOutMap: Ref<Record<string, string>>;
  batchSwapKind: Ref<SwapKind>;
  shouldUseBatchRelayer: Ref<boolean>;
  batchRelayerSwap: Ref<any | null>;
  exitPoolAndBatchSwap: Ref<any | null>;
  exitPoolBatchSwapWrappedTokensOut: Ref<{ token: string; amount: string }[]>;
  loadingAmountsOut: Ref<boolean>;
  initMath: () => Promise<void>;
  resetMath: () => void;
  getSwap: () => Promise<void>;
};

export default function useWithdrawMath(
  pool: Ref<FullPool>,
  usdAsset: Ref<string>,
  isProportional: Ref<boolean> = ref(true),
  tokenOut: Ref<string> = ref(''),
  tokenOutIndex: Ref<number> = ref(0)
): WithdrawMathResponse {
  /**
   * STATE
   */
  const propBptIn = ref('');
  const tokenOutAmount = ref('');
  const exitPoolAndBatchSwapAmountsOut = ref<string[]>([]);
  const exitPoolAndBatchSwapSingleAssetMaxes = ref<string[]>([]);
  const exitPoolAndBatchSwap = ref<TransactionData | null>(null);
  const exitPoolBatchSwapWrappedTokensOut = ref<
    { token: string; amount: string }[]
  >([]);

  const batchSwap = ref<BatchSwapOut | null>(null);
  const batchSwapUsd = ref<BatchSwapOut | null>(null);
  const batchSwapLoading = ref(false);
  const exitBatchSwapLoading = ref(false);

  const batchRelayerSwap = ref<any | null>(null);
  const batchRelayerSwapLoading = ref(false);

  // This array can be set by either a regular batch swap result
  // or a batch relayer result, if the batch swap returns 0.
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
  const {
    minusSlippage,
    addSlippageScaled,
    minusSlippageScaled
  } = useSlippage();
  const { currency } = useUserSettings();
  const {
    isStablePhantomPool,
    hasNestedUsdStablePhantomPool,
    isWeightedPoolWithNestedLinearPools,
    hasNestedLinearPools
  } = usePool(pool);
  const { slippageScaled } = useUserSettings();
  const {
    promises: swapPromises,
    processing: processingSwaps,
    processAll: processSwaps
  } = usePromiseSequence();
  const { networkConfig } = useConfig();

  /**
   * SERVICES
   */
  const poolCalculator = new PoolCalculator(pool, allTokens, balances, 'exit');

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    if (isStablePhantom(pool.value.poolType) && pool.value.mainTokens) {
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

  const poolDecimals = computed((): number => 18);
  //const poolDecimals = computed((): number => pool.value.onchain.decimals);

  const nestedPoolTokens = computed(() => {
    const tokens = pool.value.mainTokens || [];

    return tokens.filter(
      token =>
        !(
          configService.network.usdTokens.includes(token) &&
          token.toLowerCase() !== usdAsset.value.toLowerCase()
        )
    );
  });

  /**
   * The tokens being withdrawn
   * In most cases these are the same as the pool tokens
   * except for Stable Phantom pools
   */
  const withdrawalTokens = computed((): TokenInfo[] => {
    if (isWeightedPoolWithNestedLinearPools.value) {
      return nestedPoolTokens.value.map(address => getToken(address));
    }

    return tokenAddresses.value.map(address => getToken(address));
  });

  const bptBalance = computed(() => balanceFor(pool.value.address));
  const bptBalanceScaled = computed((): string =>
    parseUnits(bptBalance.value, poolDecimals.value).toString()
  );

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenOutPoolBalance = computed(() => {
    if (
      isStablePhantomPool.value &&
      hasNestedUsdStablePhantomPool.value &&
      pool.value.mainTokens &&
      pool.value.mainTokens[tokenOutIndex.value]
    ) {
      const poolToken = pool.value.tokens.find(
        token => token.address === tokenOut.value
      );

      if (poolToken) {
        return poolToken.balance;
      }

      const tokenAddress = getAddress(
        pool.value.mainTokens[tokenOutIndex.value]
      );

      if (networkConfig.usdTokens.includes(tokenAddress)) {
        const bbUsdPoolToken = pool.value.tokens.find(
          token =>
            token.address.toLowerCase() ===
            networkConfig.addresses.bbUsd.toLowerCase()
        );

        return bbUsdPoolToken?.balance || '0';
      }

      const linearPool = pool.value.linearPools?.find(
        linearPool =>
          linearPool.mainToken.address.toLowerCase() ===
          tokenAddress.toLowerCase()
      );

      if (linearPool) {
        return linearPool.mainTokenTotalBalance;
      }
    } else if (
      isWeightedPoolWithNestedLinearPools.value &&
      pool.value.mainTokens &&
      pool.value.mainTokens[tokenOutIndex.value]
    ) {
      const tokenAddress = getAddress(
        pool.value.mainTokens[tokenOutIndex.value]
      );

      const linearPool = pool.value.linearPools?.find(
        linearPool =>
          linearPool.mainToken.address.toLowerCase() ===
          tokenAddress.toLowerCase()
      );

      return linearPool?.mainTokenTotalBalance || '0';
    }

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
    if (
      isStablePhantomPool.value &&
      hasNestedUsdStablePhantomPool.value &&
      pool.value.mainTokens
    ) {
      const stablePhantomPool = pool.value.stablePhantomPools![0];
      const bptInScaled = parseUnits(propBptIn.value, 18);
      const fixedRatio = poolCalculator.ratioOf('send', 0);

      return pool.value.mainTokens.map(mainToken => {
        const poolToken = getPoolTokenForMainToken(mainToken);
        const tokenIdx = pool.value.tokens.findIndex(
          token =>
            token.address.toLowerCase() === poolToken?.address.toLowerCase()
        );

        if (networkConfig.usdTokens.includes(mainToken)) {
          const linearPool = pool.value.linearPools?.find(
            linearPool =>
              linearPool.mainToken.address.toLowerCase() ===
              mainToken.toLowerCase()
          );
          const usdTotalBalance = bnSum(
            stablePhantomPool.tokens.map(token =>
              parseUnits(token.balance, token.decimals).toString()
            )
          ).toString();
          const usdToken = stablePhantomPool.tokens.find(
            token =>
              token.address.toLowerCase() === linearPool?.address.toLowerCase()
          );
          const usdTokenBalance = parseUnits(
            usdToken?.balance || '0',
            usdToken?.decimals || 18
          );

          return formatUnits(
            bptInScaled
              .mul(poolCalculator.receiveRatios[tokenIdx])
              .div(fixedRatio)
              .mul(usdTokenBalance)
              .div(usdTotalBalance),
            18
          );
        }

        return formatUnits(
          bptInScaled
            .mul(poolCalculator.receiveRatios[tokenIdx])
            .div(fixedRatio),
          18
        );
      });
    }

    const { receive } = poolCalculator.propAmountsGiven(
      propBptIn.value,
      0,
      'send'
    );

    return receive;
  });

  /**
   * Proportional amounts out for a StablePhantom pool's output tokens.
   * Derived from queryBatchSwap or batchRelayer amounts out result.
   * Output tokens could be the mainTokens or unwrapped wrapped tokens.
   * e.g. USDC, USDT, DAI or aUSDC, aUSDT, aDAI
   */
  const proportionalMainTokenAmounts = computed((): string[] => {
    if (shouldUseBatchRelayer.value && batchRelayerSwap.value) {
      return batchRelayerSwap.value.outputs.amountsOut.map((amount, i) => {
        const _amount = bnum(amount.toString())
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    } else if (batchSwap.value) {
      return batchSwap.value.returnAmounts.map((amount, i) => {
        const _amount = bnum(amount.toString())
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    }
    return new Array(tokenCount.value).fill('0');
  });

  const proportionalNestedMainTokenAmounts = computed((): string[] => {
    return exitPoolAndBatchSwapAmountsOut.value;
  });

  const proportionalAmounts = computed((): string[] => {
    if (isStablePhantomPool.value) {
      return proportionalMainTokenAmounts.value;
    } else if (pool.value.mainTokens) {
      return proportionalNestedMainTokenAmounts.value;
    }

    return proportionalPoolTokenAmounts.value;
  });

  const fullAmounts = computed(() => {
    if (isProportional.value) return proportionalAmounts.value;

    if (isWeightedPoolWithNestedLinearPools.value) {
      return withdrawalTokens.value.map((withdrawToken, i) => {
        return withdrawToken.address.toLowerCase() ===
          tokenOut.value.toLowerCase()
          ? tokenOutAmount.value || '0'
          : '0';
      });
    }

    return new Array(tokenCount.value).fill('0').map((_, i) => {
      return i === tokenOutIndex.value ? tokenOutAmount.value || '0' : '0';
    });
  });

  const fullAmountsScaled = computed((): string[] => {
    return fullAmounts.value.map((amount, i) => {
      const indexOfDecimal = amount.indexOf('.');

      return parseUnits(
        amount.slice(0, indexOfDecimal + withdrawalTokens.value[i].decimals),
        withdrawalTokens.value[i].decimals
      ).toString();
    });
  });

  const singleAssetWithdrawAmountsStablePhantomWithNestedUsd = computed(() => {
    if (!hasNestedUsdStablePhantomPool.value || batchSwapUsd.value === null) {
      return [];
    }

    const returnAmount = bnum(batchSwapUsd.value.returnAmounts[0].toString())
      .abs()
      .toString();

    return pool.value.tokensList.map(token => {
      if (token.toLowerCase() === tokenOut.value.toLowerCase()) {
        const tokenInfo = getToken(token);

        return formatUnits(returnAmount, tokenInfo.decimals);
      } else if (
        networkConfig.usdTokens.includes(tokenOut.value) &&
        token === configService.network.addresses.bbUsd.toLowerCase()
      ) {
        const tokenInfo = getToken(tokenOut.value);

        return formatUnits(returnAmount, tokenInfo.decimals);
      }

      const linearPool = pool.value.linearPools?.find(
        linearPool => linearPool.address.toLowerCase() === token.toLowerCase()
      );

      if (
        linearPool &&
        tokenOut.value.toLowerCase() ===
          linearPool.mainToken.address.toLowerCase()
      ) {
        return formatUnits(returnAmount, linearPool.mainToken.decimals);
      }

      return '0';
    });
  });

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
   * The BPT value to be used for the withdrawal transaction without accounting for slippage.
   */
  const fullBPTIn = computed((): string => {
    if (isProportional.value)
      return parseUnits(propBptIn.value, poolDecimals.value).toString();
    if (!exactOut.value)
      return parseUnits(bptBalance.value, poolDecimals.value).toString(); // Single asset max withdrawal

    // Else single asset exact out amount case

    if (isStablePhantomPool.value) {
      if (shouldUseBatchRelayer.value) {
        return batchRelayerSwap.value?.outputs?.amountsIn || '0';
      }
      return batchSwap.value?.returnAmounts?.[0]?.toString() || '0';
    } else if (
      isWeightedPoolWithNestedLinearPools.value &&
      hasNestedUsdStablePhantomPool.value
    ) {
      const withdrawTokenIndex = withdrawalTokens.value.findIndex(
        withdrawToken =>
          withdrawToken.address.toLowerCase() === tokenOut.value.toLowerCase()
      );

      return (
        poolCalculator
          //TODO: this is wrong, mixing main token and phantom BPT
          .bptInForExactTokenOut(tokenOutAmount.value, withdrawTokenIndex)
          .toString()
      );
    }

    return poolCalculator
      .bptInForExactTokenOut(tokenOutAmount.value, tokenOutIndex.value)
      .toString();
  });

  /**
   * The BPT value to be used for the withdrawal transaction accounting for slippage.
   * Only in the single asset exact out case should the BPT value be adjusted to account for slippage.
   */
  const bptIn = computed((): string => {
    if (exactOut.value) return addSlippageScaled(fullBPTIn.value);
    return fullBPTIn.value.toString();
  });

  const normalizedBPTIn = computed((): string =>
    formatUnits(bptIn.value, poolDecimals.value)
  );

  const hasAmounts = computed(() =>
    fullAmounts.value.some(amount => bnum(amount).gt(0))
  );

  const poolTokenSingleAssetMaxes = computed((): string[] => {
    return poolTokens.value.map((token, tokenIndex) => {
      return formatUnits(
        poolCalculator
          .exactBPTInForTokenOut(bptBalance.value, tokenIndex)
          .toString(),
        token.decimals
      );
    });
  });

  const singleAssetMaxes = computed((): string[] => {
    if (isStablePhantomPool.value) return batchSwapSingleAssetMaxes.value;
    if (isWeightedPoolWithNestedLinearPools.value)
      return exitPoolAndBatchSwapSingleAssetMaxes.value;

    return poolTokenSingleAssetMaxes.value;
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

    if (hasNestedUsdStablePhantomPool.value && batchSwapUsd.value !== null) {
      return (
        poolCalculator
          .priceImpact(
            singleAssetWithdrawAmountsStablePhantomWithNestedUsd.value,
            {
              exactOut: exactOut.value,
              tokenIndex: tokenOutIndex.value,
              queryBPT: fullBPTIn.value
            }
          )
          .toNumber() || 0
      );
    }

    return poolCalculator
      .priceImpact(fullAmounts.value, {
        exactOut: exactOut.value,
        tokenIndex: tokenOutIndex.value,
        queryBPT: fullBPTIn.value
      })
      .toNumber();
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01)
  );

  const fiatAmounts = computed((): string[] => {
    return fullAmounts.value.map((amount, i) =>
      toFiat(amount, withdrawalTokens.value[i].address)
    );
  });

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
      pool.value &&
      isStablePhantomPool.value &&
      bnum(normalizedBPTIn.value).gt(0)
  );

  const shouldFetchExitBatchSwap = computed(
    (): boolean =>
      pool.value &&
      !isStablePhantomPool.value &&
      bnum(normalizedBPTIn.value).gt(0) &&
      !!pool.value.mainTokens
  );

  const shouldUseBatchRelayer = computed((): boolean => {
    if (!isStablePhantomPool.value || !pool.value.onchain.linearPools)
      return false;

    // If batchSwap has any 0 return amounts, we should use batch relayer
    if (batchSwap.value) {
      const returnAmounts = batchSwap.value.returnAmounts;
      return hasBpt.value && returnAmounts.some(amount => bnum(amount).eq(0));
    }

    return false;
  });

  // Token amounts out to pass in to batch swap transaction and used as limits.
  const batchSwapAmountsOutMap = computed(
    (): Record<string, string> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts
        .filter(([, amount]) => bnum(amount).gt(0))
        .map(([token, amount]) => {
          return [
            token,
            exactOut.value ? amount : minusSlippageScaled(amount.toString())
          ];
        });
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  // An array of BPT values to be passed into the batch swap tx
  const batchSwapBPTIn = computed((): string[] => {
    if (singleAssetMaxOut.value) return [bptBalanceScaled.value];
    if (exactOut.value) {
      return batchSwap.value ? batchSwap.value.returnAmounts : [];
    }

    const poolTokenSum = bnSum(proportionalPoolTokenAmounts.value).toString();

    const fractionalBPTIn = proportionalPoolTokenAmounts.value
      .map(poolTokenAmount => {
        const fraction = bnum(poolTokenAmount).div(poolTokenSum);
        return fraction
          .times(normalizedBPTIn.value)
          .toFixed(poolDecimals.value, OldBigNumber.ROUND_DOWN);
      })
      .filter(BPT => bnum(BPT).gt(0));

    return fractionalBPTIn.map(bptFraction =>
      parseUnits(bptFraction, poolDecimals.value).toString()
    );
  });

  const batchSwapTokensOut = computed((): string[] => {
    if (singleAssetMaxOut.value) return [tokenOut.value];
    return tokenAddresses.value.map(address => address.toLowerCase());
  });

  const batchSwapKind = computed(
    (): SwapKind => (exactOut.value ? SwapKind.GivenOut : SwapKind.GivenIn)
  );

  const batchRelayerTokenOut = computed((): string => {
    const mainTokens = pool.value?.mainTokens || [];
    const mainToken = mainTokens[tokenOutIndex.value];
    const linearPool = (pool.value?.linearPools || []).find(
      linearPool =>
        linearPool.mainToken.address.toLowerCase() === mainToken.toLowerCase()
    );

    return linearPool?.mainToken.address || '';
    //return linearPool?.wrappedToken.address || '';
  });

  const loadingAmountsOut = computed(
    (): boolean =>
      batchSwapLoading.value ||
      batchRelayerSwapLoading.value ||
      exitBatchSwapLoading.value
  );

  /**
   * METHODS
   */
  async function initMath(): Promise<void> {
    propBptIn.value = bptBalance.value;

    if (shouldFetchBatchSwap.value) {
      batchSwap.value = await getBatchSwap();
      if (shouldUseBatchRelayer.value) {
        await balancer.swaps.fetchPools();
        batchRelayerSwap.value = await getBatchRelayerSwap();
      }
    }

    if (isWeightedPoolWithNestedLinearPools.value) {
      await getBatchRelayerExitPoolAndBatchSwap();
    }
  }

  function resetMath(): void {
    initMath();
    tokenOutAmount.value = '';
  }

  /**
   * Returns wrappedToken price rate for conversion to stable.
   * @param wrappedToken the wrapped linear pool token address.
   */
  function scaledWrappedTokenRateFor(wrappedToken: string): string {
    if (!pool.value.onchain.linearPools) return '0';

    const normalPriceRate =
      Object.values(pool.value.onchain.linearPools).find(
        linearPool => linearPool.wrappedToken.address === wrappedToken
      )?.wrappedToken?.priceRate || '0';

    return parseUnits(normalPriceRate, 18).toString();
  }

  /**
   * Given either BPT in or the exact tokens out, fetches batch swap
   * required, where return amounts are the opposite of amounts.
   * @param amounts either BPT in amounts or exact out amounts
   * @param tokensOut tokens to recieve
   * @param swapType defaults to exact in
   */
  async function getBatchSwap(
    amounts: string[] | null = null,
    tokensOut: string[] | null = null,
    swapType: SwapType = SwapType.SwapExactIn
  ): Promise<BatchSwapOut> {
    batchSwapLoading.value = true;

    const batchSwapAmounts = amounts || batchSwapBPTIn.value;
    tokensOut = tokensOut || batchSwapTokensOut.value;
    const tokensIn = batchSwapAmounts.map(() => pool.value.address);
    const fetchPools = !batchSwap.value; // Only needs to be fetched on first call

    if (hasNestedUsdStablePhantomPool.value) {
      const usdBatchSwapAmounts = tokensOut.map((address, index) => ({
        address,
        amount: batchSwapAmounts[index] || '0'
      }));
      /*.filter(item =>
          configService.network.usdTokens.includes(getAddress(item.address))
        );*/

      if (usdBatchSwapAmounts.length > 0) {
        batchSwapUsd.value = await balancer.swaps.queryBatchSwapWithSor({
          tokensIn: usdBatchSwapAmounts.map(() => pool.value.address),
          tokensOut: usdBatchSwapAmounts.map(item => item.address),
          swapType,
          amounts: usdBatchSwapAmounts.map(item => item.amount),
          fetchPools: {
            fetchPools,
            fetchOnChain: false
          }
        });
      }
    }

    const result = await balancer.swaps.queryBatchSwapWithSor({
      tokensIn: tokensIn,
      tokensOut,
      swapType,
      amounts: batchSwapAmounts,
      fetchPools: {
        fetchPools,
        fetchOnChain: false
      }
    });

    batchSwapLoading.value = false;
    return result;
  }

  /**
   * Given either BPT in or the exact wrapped tokens out to convert to stables,
   * fetches batch swap using the relayer required, where return amounts are the
   * opposite of amounts.
   * @param amounts either BPT in amounts or exact out amounts
   * @param tokensOut wrapped tokens to convert to stables
   * @param swapType defaults to exact in
   */
  async function getBatchRelayerSwap(
    amounts: string[] | null = null,
    tokensOut: string[] | null = null,
    exactOut = false
  ): Promise<TransactionData> {
    batchRelayerSwapLoading.value = true;
    amounts = amounts || batchSwapBPTIn.value.map(amount => amount.toString());
    tokensOut = tokensOut || pool.value.mainTokens || [];
    //const fetchPools = !batchRelayerSwap.value; // Only needs to be fetched on first call

    const exits = tokensOut.map((tokenOut, index) => {
      const linearPool = pool.value.linearPools?.find(
        linearPool =>
          linearPool.mainToken.address.toLowerCase() === tokenOut.toLowerCase()
      );
      const amount = (amounts || [])[index];

      const amountHumanReadable = scaleDown(
        new BigNumber(amount),
        18
      ).toString();

      return {
        tokenOut,
        bptAmountIn: amount,
        //TODO: this is an approximation
        unwrap:
          linearPool &&
          parseFloat(amountHumanReadable) >
            parseFloat(linearPool.mainToken.balance)
      };
    });

    const linearPools = pool.value.linearPools || [];
    exitPoolBatchSwapWrappedTokensOut.value = exits
      .filter(exit => exit.unwrap)
      .map(exit => ({
        token:
          linearPools.find(
            linearPool =>
              linearPool.mainToken.address.toLowerCase() ===
              exit.tokenOut.toLowerCase()
          )?.wrappedToken.address || '',
        amount: exit.bptAmountIn
      }));

    const result = await balancerContractsService.batchRelayer.service.sdk.relayer.swapAndUnwrapStablePhantomPool(
      {
        poolId: pool.value.id,
        exits,
        slippage: slippageScaled.value,
        account: account.value
      }
    );

    /*const rates: string[] = [];
    tokensOut.forEach((tokenOut, i) => {
      rates[i] = scaledWrappedTokenRateFor(tokenOut);
    });

    const result = await balancerContractsService.batchRelayer.stableExitStatic(
      account.value,
      pool.value.address,
      amounts,
      tokensOut,
      rates,
      slippageScaled.value,
      exactOut,
      fetchPools
    );*/

    batchRelayerSwapLoading.value = false;
    return result;
  }

  function getExitPoolBatchSwapTokensOut(expectedAmountsOut: string[]) {
    const batchSwapTokens = (pool.value.mainTokens || []).map((token, idx) => {
      const linearPool = pool.value.linearPools?.find(
        linearPool => linearPool.mainToken.address === token
      );
      const expectedAmountOut = parseFloat(
        formatUnits(expectedAmountsOut[idx] || '0', 18)
      );

      if (
        linearPool &&
        parseFloat(linearPool.mainToken.balance) < expectedAmountOut
      ) {
        return linearPool.wrappedToken.address;
      }

      return token;
    });

    if (
      !hasNestedUsdStablePhantomPool.value &&
      !isWeightedPoolWithNestedLinearPools.value
    ) {
      return batchSwapTokens;
    }

    const usdTokens = configService.network.usdTokens;
    const usdTokenToWrappedTokenMap =
      configService.network.usdTokenToWrappedTokenMap;
    const wrappedUsdTokens = Object.values(usdTokenToWrappedTokenMap);

    return batchSwapTokens
      .filter((batchSwapToken, idx) => {
        if (
          usdTokens.includes(batchSwapToken) ||
          wrappedUsdTokens.includes(batchSwapToken)
        ) {
          if (isProportional.value) {
            return (
              batchSwapToken.toLowerCase() === usdAsset.value.toLowerCase() ||
              usdTokenToWrappedTokenMap[
                getAddress(usdAsset.value)
              ]?.toLowerCase() === batchSwapToken.toLowerCase()
            );
          } else if (
            !usdTokens.includes(tokenOut.value) &&
            !wrappedUsdTokens.includes(tokenOut.value)
          ) {
            return (
              batchSwapTokens
                .slice(0, idx)
                .filter(
                  token =>
                    usdTokens.includes(token) ||
                    wrappedUsdTokens.includes(token)
                ).length === 0
            );
          }

          return (
            tokenOut.value.toLowerCase() === batchSwapToken.toLowerCase() ||
            usdTokenToWrappedTokenMap[tokenOut.value]?.toLowerCase() ===
              batchSwapToken.toLowerCase()
          );
        }

        return true;
      })
      .map((batchSwapToken, idx) => {
        if (configService.network.usdTokens.includes(batchSwapToken)) {
          const linearPool = pool.value.linearPools?.find(
            linearPool => linearPool.mainToken.address === batchSwapToken
          );
          const expectedAmountOut = parseFloat(
            formatUnits(expectedAmountsOut[idx] || '0', 18)
          );

          if (
            linearPool &&
            parseFloat(linearPool.mainToken.balance) < expectedAmountOut
          ) {
            return linearPool.wrappedToken.address;
          }
        }

        return batchSwapToken;
      });
  }

  async function getBatchRelayerExitPoolAndBatchSwap() {
    exitBatchSwapLoading.value = true;
    await balancer.swaps.fetchPools();

    let expectedAmountsOut: string[] = fullAmountsScaled.value;

    //determine expectedAmountsOut based on tokensOut
    if (isProportional.value) {
      expectedAmountsOut = proportionalPoolTokenAmounts.value.map(
        (amount, index) => {
          const token = getToken(pool.value.tokensList[index]);

          return parseUnits(amount, token.decimals).toString();
        }
      );
    } else {
      expectedAmountsOut = tokenAddresses.value.map((tokenAddress, index) => {
        if (
          tokenAddress.toLowerCase() ===
            configService.network.addresses.bbUsd.toLowerCase() &&
          configService.network.usdTokens.includes(tokenOut.value)
        ) {
          return parseUnits(poolTokenSingleAssetMaxes.value[index]).toString();
        }

        const linearPool = (pool.value.linearPools || []).find(
          linearPool => linearPool.mainToken.address === tokenOut.value
        );

        if (linearPool?.address.toLowerCase() === tokenAddress.toLowerCase()) {
          return parseUnits(poolTokenSingleAssetMaxes.value[index]).toString();
        }

        if (tokenAddress.toLowerCase() === tokenOut.value.toLowerCase()) {
          return parseUnits(poolTokenSingleAssetMaxes.value[index]).toString();
        }

        return '0';
      });
    }

    const tokensOut = getExitPoolBatchSwapTokensOut(expectedAmountsOut);
    //TODO: this might now be broken for weighted boosted with 1 base token
    exitPoolBatchSwapWrappedTokensOut.value = tokensOut
      .map((token, idx) => ({ token, amount: expectedAmountsOut[idx] }))
      .filter(
        item =>
          !!(pool.value.linearPools || []).find(
            linearPool => linearPool.wrappedToken.address === item.token
          )
      );

    try {
      const bbUsd = configService.network.addresses.bbUsd.toLowerCase();
      const usdTokens = configService.network.usdTokens;
      const linearPools = pool.value.linearPools || [];
      hasNestedUsdStablePhantomPool.value;

      const exits = pool.value.tokensList.map((exitToken, index) => {
        const linearPool = linearPools.find(
          linearPool => exitToken === linearPool.address
        );

        return {
          exitToken,
          exitExpectedAmountOut: expectedAmountsOut[index],
          batchSwapTokenOut:
            exitToken === bbUsd
              ? tokensOut.find(tokenOut => usdTokens.includes(tokenOut))
              : linearPool
              ? tokensOut.find(
                  tokenOut =>
                    tokenOut === linearPool.mainToken.address ||
                    tokenOut === linearPool.wrappedToken.address
                )
              : undefined
        };
      });

      const response = await balancer.relayer.exitPoolAndBatchSwap({
        poolId: pool.value.id,
        exiter: account.value,
        swapRecipient: account.value,
        exits,
        userData: WeightedPoolEncoder.exitExactBPTInForTokensOut(
          isProportional.value ? fullBPTIn.value : bptBalanceScaled.value
        ),
        slippage: slippageScaled.value,
        fetchPools: {
          fetchPools: true,
          fetchOnChain: false
        },
        unwrap: true
      });

      const amountsOut = (response.outputs?.amountsOut ?? []).map(
        (amount, index) => {
          const token = getToken(
            exits[index].batchSwapTokenOut || exits[index].exitToken
          );

          return scaleDown(bnum(amount).abs(), token.decimals).toString();
        }
      );

      if (isProportional.value) {
        exitPoolAndBatchSwapAmountsOut.value = amountsOut;
      } else {
        const amountsOutIndex = tokensOut.findIndex(
          token => token === tokenOut.value
        );
        const tokenIndex = (pool.value.mainTokens || []).findIndex(
          mainToken => mainToken.toLowerCase() === tokenOut.value.toLowerCase()
        );

        exitPoolAndBatchSwapSingleAssetMaxes.value[tokenIndex] =
          amountsOut[amountsOutIndex];
      }

      exitPoolAndBatchSwap.value = response;
    } catch (e) {
      console.log('error occurred calling exitPoolAndBatchSwap', e);
    }

    exitBatchSwapLoading.value = false;
  }

  // Fetch single asset max out for current tokenOut using batch swaps.
  // Set max out returned from batchSwap in state.
  async function getSingleAssetMaxOut(): Promise<void> {
    const _batchSwap = await getBatchSwap(
      [bptBalanceScaled.value],
      [tokenOut.value]
    );

    const batchSwapAmountOut = bnum(
      _batchSwap.returnAmounts[0].toString()
    ).abs();

    if (batchSwapAmountOut.gt(0)) {
      const amountOut = formatUnits(
        batchSwapAmountOut.toString(),
        tokenOutDecimals.value
      );

      batchSwapSingleAssetMaxes.value[tokenOutIndex.value] = amountOut;
    } else if (pool.value.linearPools && pool.value.linearPools.length > 0) {
      const _batchRelayerSwap = await getBatchRelayerSwap(
        [bptBalanceScaled.value.toString()],
        [batchRelayerTokenOut.value]
      );

      const batchRelayerAmountOut = bnum(
        _batchRelayerSwap.outputs?.amountsOut
          ? _batchRelayerSwap.outputs.amountsOut[0].toString()
          : '0'
      ).abs();
      const amountOut = formatUnits(
        batchRelayerAmountOut.toString(),
        tokenOutDecimals.value
      );

      batchSwapSingleAssetMaxes.value[tokenOutIndex.value] = amountOut;
    }
  }

  /**
   * High level function that uses withdrawal state to
   * decide what swap should be fetched and sets it.
   */
  async function getSwap(): Promise<void> {
    if (isWeightedPoolWithNestedLinearPools.value) {
      getBatchRelayerExitPoolAndBatchSwap().catch();
    }

    if (!isStablePhantomPool.value) return;

    if (isProportional.value) {
      batchSwap.value = await getBatchSwap();

      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap();
      }
    } else if (exactOut.value) {
      const amountsOut = fullAmountsScaled.value.filter(amount =>
        bnum(amount).gt(0)
      );

      batchSwap.value = await getBatchSwap(
        amountsOut,
        [tokenOut.value],
        SwapType.SwapExactOut
      );

      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap(
          amountsOut.map(amount => amount.toString()),
          [batchRelayerTokenOut.value],
          true
        );
      }
    } else {
      // Single asset max out case
      batchSwap.value = await getBatchSwap(
        [bptBalanceScaled.value],
        [tokenOut.value]
      );

      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap(
          [bptBalanceScaled.value.toString()],
          [batchRelayerTokenOut.value]
        );
      }
    }
  }

  function getPoolTokenForMainToken(mainToken: string): PoolToken | null {
    mainToken = mainToken.toLowerCase();

    const token = pool.value.tokens.find(
      token => token.address.toLowerCase() === mainToken
    );

    //mainToken is directly in the pool, not nested
    if (token) {
      return token;
    }

    const linearPool = pool.value.linearPools?.find(
      linearPool => linearPool.mainToken.address.toLowerCase() === mainToken
    );

    if (linearPool) {
      const nestedLinearBpt = pool.value.tokens.find(
        token =>
          token.address.toLowerCase() === linearPool.address.toLowerCase()
      );

      if (nestedLinearBpt) {
        return nestedLinearBpt;
      }

      //linear is nested in a stable phantom
      const stablePhantom = pool.value.stablePhantomPools
        ? pool.value.stablePhantomPools[0]
        : undefined;
      const nestedStablePhantomBpt = pool.value.tokens.find(
        token =>
          token.address.toLowerCase() === stablePhantom?.address.toLowerCase()
      );

      if (nestedStablePhantomBpt) {
        return nestedStablePhantomBpt;
      }
    }

    return null;
  }

  /**
   * WATCHERS
   */
  watch(tokenOut, () => {
    tokenOutAmount.value = '';
    if (isStablePhantomPool.value) getSingleAssetMaxOut();

    if (isWeightedPoolWithNestedLinearPools.value) {
      getBatchRelayerExitPoolAndBatchSwap().catch();
    }
  });

  watch(usdAsset, () => {
    if (isWeightedPoolWithNestedLinearPools.value) {
      getBatchRelayerExitPoolAndBatchSwap().catch();
    }
  });

  watch(isWalletReady, async () => {
    await forChange(dynamicDataLoading, false);
    initMath();
  });

  watch(account, () => initMath());

  watch(isProportional, async (newValue, oldValue) => {
    if (newValue && !oldValue) {
      await getSwap();
    }
  });

  watch(fullAmounts, async (newAmounts, oldAmounts) => {
    if (
      !isProportional.value &&
      !isEqual(newAmounts, oldAmounts) &&
      fullAmountsScaled.value.filter(amount => bnum(amount).gt(0)).length > 0
    ) {
      await getSwap();
      //swapPromises.value.push(getSwap);
      //if (!processingSwaps.value) processSwaps();
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
    shouldFetchExitBatchSwap,
    batchSwap,
    batchSwapAmountsOutMap,
    batchSwapKind,
    shouldUseBatchRelayer,
    batchRelayerSwap,
    loadingAmountsOut,
    exitPoolAndBatchSwap,
    exitPoolBatchSwapWrappedTokensOut,
    // methods
    initMath,
    resetMath,
    getSwap
  };
}
