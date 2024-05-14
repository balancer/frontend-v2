import { aBoostedPool } from '@/__mocks__/boosted-pool';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { Pool } from '@/services/pool/types';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { randomAddress } from '@tests/unit/builders/address';
import { useDisabledJoinPool } from './useDisabledJoinPool';
import useNetwork from './useNetwork';
import { dateToUnixTimestamp } from './useTime';

initDependenciesWithDefaultMocks();

async function mountVettedTokensInPool(pool: Pool) {
  const { result } = await mountComposable(() => useDisabledJoinPool(pool));
  return result;
}

it('disables joins for pools with no initial liquidity', async () => {
  const pool = aBoostedPool();
  pool.totalShares = '0';
  const { disableJoinsReason, shouldDisableJoins } =
    await mountVettedTokensInPool(pool);

  expect(shouldDisableJoins.value).toBeTrue();
  expect(disableJoinsReason.value.notInitialLiquidity).toBeTrue();
});

it('allows joins for pools on test networks with non vetted tokens', async () => {
  const { networkId } = useNetwork();
  networkId.value = 5;

  const pool = aBoostedPool();
  pool.createTime = dateToUnixTimestamp('2023-03-30'); //Created after 29 March
  const { disableJoinsReason, shouldDisableJoins } =
    await mountVettedTokensInPool(pool);

  pool.tokens[0].address = randomAddress();

  console.log('Reason: ', disableJoinsReason.value);
  expect(shouldDisableJoins.value).toBeFalse();
});
