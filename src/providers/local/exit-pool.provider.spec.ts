import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { poolIdThatRequiresInternalBalanceExit } from '@/lib/config/goerli/pools';
import { ExactInExitHandler } from '@/services/balancer/pools/exits/handlers/exact-in-exit.handler';
import { RecoveryExitHandler } from '@/services/balancer/pools/exits/handlers/recovery-exit.handler';
import { Pool } from '@/services/pool/types';
import { txResponseMock } from '@/__mocks__/transactions';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import waitForExpect from 'wait-for-expect';
import { exitPoolProvider } from './exit-pool.provider';

initDependenciesWithDefaultMocks();

async function mountExitPoolProvider(pool: Pool) {
  // Pretend that pools for SOR were fetched
  hasFetchedPoolsForSor.value = true;
  const debounceQueryExitMillis = 10;
  const debounceGetSingleAssetMaxMillis = 10;
  const { result } = await mountComposable(() =>
    exitPoolProvider(
      ref(pool),
      debounceQueryExitMillis,
      debounceGetSingleAssetMaxMillis
    )
  );

  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeFalse();
  });

  const exitSpy = vi.spyOn(result.exitPoolService, 'exit');

  return { ...result, exitSpy };
}

test('exits a weighted pool with default exit handler (ExactOut)', async () => {
  const { amountsOut, exitPoolService, approvalActions, exit } =
    await mountExitPoolProvider(aWeightedPool());

  expect(amountsOut.value).toEqual([
    {
      address: groAddress,
      max: '',
      valid: true,
      value: '0',
    },
    {
      address: wethAddress,
      max: '',
      valid: true,
      value: '0',
    },
  ]);

  expect(approvalActions.value).toEqual([]);

  const exitResult = await exit();

  expect(exitResult).toEqual(txResponseMock);
  expect(exitPoolService.exitHandler).toBeInstanceOf(ExactInExitHandler);
});

test('exits a weighted pool with recovery exit when it is in recovery mode and it is paused', async () => {
  const pool = aWeightedPool();
  //@ts-ignore
  pool.isInRecoveryMode = (): boolean => true;
  //@ts-ignore
  pool.isPaused = (): boolean => true;

  const { amountsOut, exitPoolService, approvalActions, exit } =
    await mountExitPoolProvider(pool);

  expect(amountsOut.value).toEqual([
    {
      address: groAddress,
      max: '',
      valid: true,
      value: '0',
    },
    {
      address: wethAddress,
      max: '',
      valid: true,
      value: '0',
    },
  ]);

  expect(approvalActions.value).toEqual([]);

  const exitResult = await exit();

  expect(exitResult).toEqual(txResponseMock);
  expect(exitPoolService.exitHandler).toBeInstanceOf(RecoveryExitHandler);
});

test('exits a weighted pool via internal balance exit', async () => {
  const pool = aWeightedPool();
  pool.id = poolIdThatRequiresInternalBalanceExit;

  const {
    amountsOut,
    exitPoolService,
    approvalActions,
    exit,
    exitSpy,
    shouldExitViaInternalBalance,
  } = await mountExitPoolProvider(pool);

  expect(shouldExitViaInternalBalance.value).toBeTrue();

  expect(amountsOut.value).toEqual([
    {
      address: groAddress,
      max: '',
      valid: true,
      value: '0',
    },
    {
      address: wethAddress,
      max: '',
      valid: true,
      value: '0',
    },
  ]);

  expect(approvalActions.value).toEqual([]);

  const exitResult = await exit();

  expect(exitResult).toEqual(txResponseMock);
  expect(exitPoolService.exitHandler).toBeInstanceOf(ExactInExitHandler);

  expect(exitSpy).toHaveBeenCalledOnceWith(
    expect.objectContaining({ toInternalBalance: true })
  );
});
