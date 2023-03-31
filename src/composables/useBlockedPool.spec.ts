import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { toDateTimestamp } from '@/lib/utils/time';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { useBlockedPool } from './useBlockedPool';

initDependenciesWithDefaultMocks();

async function mountVettedTokensInPool(pool: Pool) {
  const { result } = await mountComposable(() => useBlockedPool(pool));
  return result;
}

it('blocks pools with no initial liquidity', async () => {
  const pool = BoostedPoolMock;
  pool.totalShares = '0';
  const result = await mountVettedTokensInPool(pool);

  expect(result.shouldBlockPool.value).toBeTrue();
  expect(result.noInitLiquidityBlock.value).toBeTrue();
});

it('blocks pools created after 29 march with non vetted tokens', async () => {
  const pool = BoostedPoolMock;
  pool.createTime = toDateTimestamp('2023-03-30'); //Created after 29 March
  const result = await mountVettedTokensInPool(pool);

  expect(result.shouldBlockPool.value).toBeTrue();
  expect(result.nonVettedTokensBlock.value).toBeTrue();
  expect(result.nonVettedTokenSymbols.value).toMatchInlineSnapshot(
    '"bb-a-USDT,USDT,bb-a-USDC,USDC,bb-a-DAI,DAI"'
  );
});

it('does not block pools created before 29 march', async () => {
  const pool = BoostedPoolMock;
  pool.totalShares = '100';
  pool.createTime = toDateTimestamp('2023-03-28'); //Created before 29 March
  const result = await mountVettedTokensInPool(pool);

  expect(result.shouldBlockPool.value).toBeFalse();
  expect(result.nonVettedTokensBlock.value).toBeFalse();
});
