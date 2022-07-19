import { SOR, SwapInfo } from '@balancer-labs/sdk';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { computed, onMounted, Ref, ref, watch } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useSlippage from '@/composables/useSlippage';
import useTokens from '@/composables/useTokens';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT
} from '@/constants/poolLiquidity';
import { balancer } from '@/lib/balancer.sdk';
import { bnum, isSameAddress } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import GasPriceService from '@/services/gas-price/gas-price.service';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { BatchSwap } from '@/types';
import { TokenInfo } from '@/types/TokenList';

export type SingleAssetInvestMathResponse = ReturnType<
  typeof useSingleAssetInvestMath
>;
const gasPriceService = new GasPriceService();

function call(tokenAddress: Ref<string>, pool: Ref<Pool>, amount: Ref<string>) {
  console.log('running call', tokenAddress.value, pool.value, amount.value);
  if (tokenAddress.value && pool.value && amount.value) {
    console.log('params', {
      decimals: pool.value.onchain?.decimals,
      tokenIn: tokenAddress.value,
      tokenOut: pool.value.address,
      amount: parseFixed(amount.value, 18),
      gasPrice: parseFixed('60', 9)
    });
    balancer.swaps
      .fetchPools()
      .then(res => {
        console.log({ res });
        balancer.swaps
          .findRouteGivenIn({
            tokenIn: tokenAddress.value,
            tokenOut: pool.value.address,
            amount: parseFixed(amount.value, 18),
            gasPrice: parseFixed('30', 9),
            maxPools: 4
          })
          .then(route => {
            console.log({ route });

            const userAddress = '0x8fE3a2A5ae6BaA201C26fC7830EB713F33d6b313';
            const deadline = BigNumber.from(
              `${Math.ceil(Date.now() / 1000) + 60}`
            ); // 60 seconds from now
            const maxSlippage = 50; // 50 bsp = 0.5%

            const transactionAttributes = balancer.swaps.buildSwap({
              userAddress,
              swapInfo: route,
              kind: 0,
              deadline,
              maxSlippage
            });
            console.log({ transactionAttributes });
          });
      })
      .catch(err => {
        console.error(err);
      });
  }
}

export default function useSingleAssetInvestMath(
  pool: Ref<Pool>,
  tokenAddress: Ref<string>,
  amount: Ref<string>,
  useNativeAsset: Ref<boolean>
) {
  /**
   * STATE
   */
  const swapRoute = ref<SwapInfo | null>(null);
  const swapRouteLoading = ref(false);
  const hasFetchedPools = ref(false);

  onMounted(() => {
    fetchPools();
  });

  /**
   * COMPOSABLES
   */
  const { toFiat, fNum2 } = useNumbers();
  const { tokens, getToken, balances, balanceFor, nativeAsset } = useTokens();
  const { minusSlippageScaled } = useSlippage();
  const { managedPoolWithTradingHalted, isStablePhantomPool } = usePool(pool);
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
  const poolToken = computed<TokenInfo>(() => getToken(tokenAddress.value));

  // Input amounts can be null so return zero if null.
  const fullAmount = computed<string>(() => amount.value || '0');

  const fullAmountScaled = computed<BigNumber>(() =>
    parseUnits(fullAmount.value, poolToken.value.decimals)
  );

  const fiatTotal = computed<string>(() =>
    toFiat(fullAmount.value, tokenAddress.value)
  );

  const fiatTotalLabel = computed<string>(() =>
    fNum2(fiatTotal.value, FNumFormats.fiat)
  );

  const hasAmount = computed<boolean>(() => bnum(fullAmount.value).gt(0));

  const priceImpact = computed((): number => {
    // TODO
    return 0;
    // if (!hasAmounts.value) return 0;
    // try {
    //   return (
    //     poolCalculator
    //       .priceImpact(fullAmounts.value, {
    //         queryBPT: fullBPTOut.value.toString()
    //       })
    //       .toNumber() || 0
    //   );
    // } catch (error) {
    //   return 1;
    // }
  });

  const highPriceImpact = computed<boolean>(() => {
    if (swapRouteLoading.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  });

  const rektPriceImpact = computed<boolean>(() => {
    if (swapRouteLoading.value) return false;
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT);
  });

  const maximized = computed<boolean>(
    () => fullAmount.value === balanceFor(tokenAddress.value)
  );

  //////////////////////////////////////////////////////////////////////////////
  // TODO: Needed?
  //////////////////////////////////////////////////////////////////////////////
  // const fullBPTOut = computed((): string => {
  //   let _bptOut: string;

  //   if (isStablePhantomPool.value) {
  //     _bptOut = batchSwap.value
  //       ? bnum(batchSwap.value.amountTokenOut)
  //           .abs()
  //           .toString()
  //       : '0';
  //   } else {
  //     _bptOut = poolCalculator
  //       .exactTokensInForBPTOut(fullAmounts.value)
  //       .toString();
  //   }

  //   console.log('query BPT', _bptOut.toString());

  //   return _bptOut;
  // });

  // const bptOut = computed((): string => {
  //   if (managedPoolWithTradingHalted.value) return fullBPTOut.value.toString();
  //   return minusSlippageScaled(fullBPTOut.value);
  // });

  //////////////////////////////////////////////////////////////////////////////
  // TODO: How to show balances?
  //////////////////////////////////////////////////////////////////////////////
  // const poolTokenBalances = computed((): string[] =>
  //   tokenAddresses.value.map(token => balanceFor(token))
  // );

  // const hasZeroBalance = computed((): boolean =>
  //   poolTokenBalances.value.map(balance => bnum(balance).eq(0)).includes(true)
  // );

  // const hasNoBalances = computed((): boolean =>
  //   poolTokenBalances.value.every(balance => bnum(balance).eq(0))
  // );

  // const hasAllTokens = computed((): boolean =>
  //   poolTokenBalances.value.every(balance => bnum(balance).gt(0))
  // );

  const shouldFetchBatchSwap = computed<boolean>(
    () => pool.value && isStablePhantomPool.value && hasAmount.value
  );

  const supportsPropotionalOptimization = computed<boolean>(
    () => !isStablePhantomPool.value
  );

  /**
   * METHODS
   */

  async function fetchPools() {
    hasFetchedPools.value = await balancer.swaps.fetchPools();
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
      tokenIn: tokenAddress.value,
      tokenOut: pool.value.address,
      amount: parseFixed(amount.value, poolToken.value.decimals),
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

  watch(fullAmount, async (newAmount, oldAmount) => {
    // call(tokenAddress, pool, amount);
    if (newAmount !== oldAmount) {
      getSwapRoute();
    }
  });

  return {
    // state
    hasFetchedPools,
    swapRoute,
    swapRouteLoading,
    // computed
    hasAmount,
    fullAmount,
    fullAmountScaled,
    // batchSwapAmountMap,
    fiatTotal,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    rektPriceImpact,
    maximized,
    // hasZeroBalance,
    // hasNoBalances,
    // hasAllTokens,
    shouldFetchBatchSwap,
    supportsPropotionalOptimization,
    // methods
    getSwapRoute
  };
}
