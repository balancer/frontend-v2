import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { useHasBlockedJoins } from './useHasBlockedJoins';

initDependenciesWithDefaultMocks();

async function mountVettedTokensInPool(pool: Pool) {
  const { result } = await mountComposable(() => useHasBlockedJoins(pool));
  return result;
}

function getUnixTimestamp(date) {
  return Date.parse(date) / 1000;
}

it('blocks pools created after 29 march with non vetted tokens', async () => {
  const pool = BoostedPoolMock;
  pool.createTime = getUnixTimestamp('2023-03-30'); //Created after 29 March
  const result = await mountVettedTokensInPool(pool);

  expect(result.hasBlockedJoins.value).toBeTrue();
  expect(result.nonVettedTokenSymbols.value).toMatchInlineSnapshot(
    '"bb-a-USDT,USDT,bb-a-USDC,USDC,bb-a-DAI,DAI"'
  );
});

it('does not block pools created before 29 march with non vetted tokens', async () => {
  const pool = BoostedPoolMock;
  pool.createTime = getUnixTimestamp('2021-01-01'); //Created before 29 March
  const result = await mountVettedTokensInPool(pool);

  expect(result.hasBlockedJoins.value).toBeFalse();
  expect(result.nonVettedTokenSymbols.value).toMatchInlineSnapshot(
    '"bb-a-USDT,USDT,bb-a-USDC,USDC,bb-a-DAI,DAI"'
  );
});
