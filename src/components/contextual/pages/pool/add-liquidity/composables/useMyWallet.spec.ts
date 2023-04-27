import { Tab } from '@/composables/pools/useInvestPageTabs';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { initMulticallerAsPoolMulticallerMock } from '@/dependencies/Multicaller.mocks';
import { provideJoinPool } from '@/providers/local/join-pool.provider';
import { providePool } from '@/providers/local/pool.provider';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { wethAddress } from '@tests/unit/builders/address';
import { anAmountIn } from '@tests/unit/builders/join-exit.builders';
import { defaultSdkPool } from '@tests/unit/builders/sdk-pool.builders';
import waitForExpect from 'wait-for-expect';
import { useMyWallet } from './useMyWallet';

initDependenciesWithDefaultMocks();
initMulticallerAsPoolMulticallerMock();

const pool = aWeightedPool();
async function mountMyWallet() {
  const { result } = await mountComposable(() => useMyWallet(), {
    intermediateProvider: () => {
      provideJoinPool(ref(pool));
      providePool(pool.id);
    },
  });
  expect(result.isLoadingPool.value).toBeTrue();
  await waitForExpect(() => expect(result.isLoadingPool.value).toBeFalse());
  return result;
}

test('excludes pool address from wallet tokens', async () => {
  const { excludedTokens } = await mountMyWallet();
  expect(excludedTokens.value).toEqual([defaultSdkPool.address]);
});

test('exposes pool from pool provider', async () => {
  const { pool: providedPool } = await mountMyWallet();
  expect(providedPool?.value?.address).toEqual(pool.address);
  expect(providedPool?.value?.address).toEqual(defaultSdkPool.address);
  expect(providedPool?.value?.tokens).toEqual(defaultSdkPool.tokens);
});

test('Maximizes the token amount when clicking a token that is a pool token', async () => {
  const { handleMyWalletTokenClick, amountsIn, setAmountsIn } =
    await mountMyWallet();

  setAmountsIn([anAmountIn({ address: wethAddress, value: '5' })]);
  const isPoolToken = true;

  handleMyWalletTokenClick(wethAddress, isPoolToken);

  expect(amountsIn.value).toEqual([
    anAmountIn({ address: wethAddress, value: '10' }), //10 is max balance for WETH
  ]);
});

test('Moves to Single Token tab when clicking a token that is not in a pool token', async () => {
  const { handleMyWalletTokenClick, amountsIn, setAmountsIn, activeTab } =
    await mountMyWallet();

  setAmountsIn([anAmountIn({ address: wethAddress, value: '5' })]);

  expect(activeTab.value).toBe(Tab.PoolTokens);

  const isPoolToken = false;
  handleMyWalletTokenClick(wethAddress, isPoolToken);

  expect(activeTab.value).toBe(Tab.SingleToken);

  await waitForExpect(() =>
    expect(amountsIn.value).toEqual([
      anAmountIn({ address: wethAddress, value: '10' }), //Also changes the token amount in to its max
    ])
  );
});

// describe('returns hasBalanceForAllTokens', async () => {
//   test('when all tokens have balance', async () => {
//     const { hasBalanceForAllTokens } = await mountMyWallet();
//     expect(hasBalanceForAllTokens.value).toBeTrue();
//   });

//   test('when some token does not have balance', async () => {
//     const tokenAddressWithoutBalance =
//       '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
//     const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
//     const { hasBalanceForAllTokens } = await mountMyWallet(pool);
//     expect(hasBalanceForAllTokens.value).toBeFalse();
//   });

//   test('when some token does not have balance', async () => {
//     const tokenAddressWithoutBalance =
//       '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
//     const pool = aWeightedPool({ tokensList: [tokenAddressWithoutBalance] });
//     const { hasBalanceForAllTokens } = await mountMyWallet(pool);
//     expect(hasBalanceForAllTokens.value).toBeFalse();
//   });
// });
