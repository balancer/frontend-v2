import { initBalancerSdkWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import { initEthersContractWithDefaultMocks } from '@/dependencies/EthersContract.mocks';
import {
  AmountIn,
  provideJoinPool,
} from '@/providers/local/join-pool.provider';
import { provideUserTokens } from '@/providers/local/user-tokens.provider';
import { defaultBalance } from '@/providers/__mocks__/tokens.provider.fake';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import { anAmountIn } from '@tests/unit/builders/join-exit.builders';
import { useInvestFormTotals } from './useInvestFormTotals';

initBalancerSdkWithDefaultMocks();
initEthersContractWithDefaultMocks();

async function mountInvestFormTotals(pool: Pool, amountsIn: AmountIn[] = []) {
  const { result } = await mountComposable(() => useInvestFormTotals(pool), {
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
    const { hasBalanceForAllTokens } = await mountInvestFormTotals(pool);
    expect(hasBalanceForAllTokens.value).toBeTrue();
  });

  test('when some token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
    const { hasBalanceForAllTokens } = await mountInvestFormTotals(pool);
    expect(hasBalanceForAllTokens.value).toBeFalse();
  });

  test('when some token does not have balance', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
    const { hasBalanceForAllTokens } = await mountInvestFormTotals(pool);
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
    const { hasBalanceForSomeTokens } = await mountInvestFormTotals(pool);
    expect(hasBalanceForSomeTokens.value).toBeTrue();
  });

  test('when a token does not have balance and the other token is WETH (wrapped native asset)', async () => {
    const tokenAddressWithoutBalance =
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
    const pool = aWeightedPool({
      tokensList: [wethAddress, tokenAddressWithoutBalance],
    });
    const { hasBalanceForSomeTokens } = await mountInvestFormTotals(pool);
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
    const { hasBalanceForSomeTokens } = await mountInvestFormTotals(pool);
    expect(hasBalanceForSomeTokens.value).toBeFalse();
  });
});

describe('calculates maximized', async () => {
  test('when both tokens have max balance', async () => {
    const pool = aWeightedPool();
    const { maximized } = await mountInvestFormTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultBalance }),
      anAmountIn({ address: wethAddress, value: defaultBalance }),
    ]);
    expect(maximized.value).toBeTrue();
  });
  test('when one of the tokens does not have max balance', async () => {
    const pool = aWeightedPool();
    const { maximized } = await mountInvestFormTotals(pool, [
      anAmountIn({ address: groAddress, value: defaultBalance }),
      anAmountIn({ address: wethAddress, value: '5' }), //5 != defaultBalance
    ]);
    expect(maximized.value).toBeFalse();
  });
});
