import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import {
  AmountIn,
  provideJoinPool,
} from '@/providers/local/join-pool.provider';
import { provideUserTokens } from '@/providers/local/user-tokens.provider';
import { defaultTokenBalance } from '@/providers/__mocks__/tokens.provider.fake';
import { Pool, PoolType } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import { anAmountIn } from '@tests/unit/builders/join-exit.builders';
import { useAddLiquidityTotals } from './useAddLiquidityTotals';

initDependenciesWithDefaultMocks();

async function mountAddLiquidityTotals(pool: Pool, amountsIn: AmountIn[] = []) {
  const { result } = await mountComposable(() => useAddLiquidityTotals(pool), {
    intermediateProvider: () => {
      provideUserTokens();
      const joinPool = provideJoinPool(ref(pool));
      joinPool.setAmountsIn(amountsIn);
    },
  });
  return result;
}

describe('returns hasBalanceForAllTokens', async () => {
  test('when all tokens have balance', async () => {
    const pool = aWeightedPool();
    const { hasBalanceForAllTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForAllTokens.value).toBeTrue();
  });

  test('when some token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
    const { hasBalanceForAllTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForAllTokens.value).toBeFalse();
  });

  test('when some token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
    const { hasBalanceForAllTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForAllTokens.value).toBeFalse();
  });
});

describe('returns hasBalanceForSomeTokens', async () => {
  test('when a token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({
      tokensList: [groAddress, tokenAddressWithoutBalance],
    });
    const { hasBalanceForSomeTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForSomeTokens.value).toBeTrue();
  });

  test('when a token does not have balance and the other token is WETH (wrapped native asset)', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({
      tokensList: [wethAddress, tokenAddressWithoutBalance],
    });
    const { hasBalanceForSomeTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForSomeTokens.value).toBeTrue();
  });

  test('when a token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const anotherAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({
      tokensList: [tokenAddressWithoutBalance, anotherAddressWithoutBalance],
    });
    const { hasBalanceForSomeTokens } = await mountAddLiquidityTotals(pool);
    expect(hasBalanceForSomeTokens.value).toBeFalse();
  });
});

describe('calculates maximized', async () => {
  test('when both tokens have max balance', async () => {
    const pool = aWeightedPool();
    const { maximized } = await mountAddLiquidityTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultTokenBalance }),
      anAmountIn({ address: wethAddress, value: defaultTokenBalance }),
    ]);
    expect(maximized.value).toBeTrue();
  });
  test('when one of the tokens does not have max balance', async () => {
    const pool = aWeightedPool();
    const { maximized } = await mountAddLiquidityTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultTokenBalance }),
      anAmountIn({ address: wethAddress, value: '5' }), //5 != defaultBalance
    ]);
    expect(maximized.value).toBeFalse();
  });
});

test('maximizes amounts', async () => {
  const pool = aWeightedPool();
  const { maximized, maximizeAmounts } = await mountAddLiquidityTotals(pool, [
    anAmountIn({ address: groAddress, value: '2' }),
    anAmountIn({ address: wethAddress, value: '4' }),
  ]);

  expect(maximized.value).toBeFalse();

  maximizeAmounts();

  expect(maximized.value).toBeTrue();
});

describe('calculates optimized', async () => {
  test('when both tokens have max balance', async () => {
    const pool = aWeightedPool();
    const { optimized } = await mountAddLiquidityTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultTokenBalance }),
      anAmountIn({ address: wethAddress, value: defaultTokenBalance }),
    ]);
    expect(optimized.value).toBeTrue();
  });
  test('when one token does not have max balance', async () => {
    const pool = aWeightedPool();
    const { optimized } = await mountAddLiquidityTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultTokenBalance }),
      anAmountIn({ address: wethAddress, value: '3' }), // 3 is less than max balance
    ]);
    expect(optimized.value).toBeFalse();
  });
  test('when pool does not support proportional optimization (not Stable like)', async () => {
    const pool = aWeightedPool();
    // Change poolType to be not stable like so supportsProportionalOptimization is false
    pool.poolType = PoolType.FX;
    const { optimized } = await mountAddLiquidityTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultTokenBalance }),
      anAmountIn({ address: wethAddress, value: defaultTokenBalance }),
    ]);
    expect(optimized.value).toBeFalse();
  });
});

test('optimizes amounts', async () => {
  const pool = aWeightedPool();
  const { optimized, optimizeAmounts } = await mountAddLiquidityTotals(pool, [
    anAmountIn({ address: groAddress, value: '2' }),
    anAmountIn({ address: wethAddress, value: '4' }),
  ]);

  expect(optimized.value).toBeFalse();

  optimizeAmounts();

  expect(optimized.value).toBeTrue();
});
