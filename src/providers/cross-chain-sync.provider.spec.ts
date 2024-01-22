import {
  callStaticMock,
  sendTransactionMock,
} from '@/dependencies/contract.concern.mocks';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { Network } from '@/lib/config/types';
import { aVotingEscrowLock } from '@/services/balancer/gauges/__mocks__/gauge-builders';
import {
  defaultMainnetVotingEscrowLock,
  defaultOmniEscrowLockArbitrum,
  mockOmniEscrowLocks,
  mockVotingEscrowLocks,
} from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import { defaultWeb3Account } from '@/services/web3/__mocks__/useWeb3';
import {
  mountComposableWithFakeTokensProvider as mountComposable,
  waitForQueryLoaded,
} from '@tests/mount-helpers';
import { firstCallParams } from '@tests/vitest/assertions';
import { crossChainSyncProvider } from './cross-chain-sync.provider';

async function mountCrossChainSync() {
  const { result } = await mountComposable(() => crossChainSyncProvider());
  await waitForQueryLoaded(result);
  return result;
}

initDependenciesWithDefaultMocks();

describe('Returns correct Sync state by network', () => {
  it('When no omniEscrowLocks', async () => {
    mockOmniEscrowLocks([]);
    const { omniEscrowLocksMap } = await mountCrossChainSync();

    expect(omniEscrowLocksMap.value).toBeNull();
    const { networksBySyncState } = await mountCrossChainSync();

    expect(networksBySyncState.value).toMatchInlineSnapshot(`
      {
        "synced": [],
        "syncing": [],
        "unsynced": [
          10,
          100,
          137,
          1101,
          8453,
          42161,
          43114,
        ],
      }
    `);
  });

  it('When omni and voting locks are the same for the network', async () => {
    mockOmniEscrowLocks([defaultOmniEscrowLockArbitrum]);

    const { networksBySyncState } = await mountCrossChainSync();

    expect(networksBySyncState.value).toMatchInlineSnapshot(`
      {
        "synced": [
          42161,
        ],
        "syncing": [],
        "unsynced": [
          10,
          100,
          137,
          1101,
          8453,
          43114,
        ],
      }
    `);
  });

  test('When Omni vs Voting bias and slope are the same in Mainnet but different in Arbitrum', async () => {
    const defaultArbitrumLockWithDifferentSlopeAndBias = aVotingEscrowLock({
      id: 'arbitrum lock',
      slope: '0.0',
      bias: '0.0',
    });

    mockVotingEscrowLocks(
      [defaultMainnetVotingEscrowLock],
      [defaultArbitrumLockWithDifferentSlopeAndBias]
    );

    mockOmniEscrowLocks([defaultOmniEscrowLockArbitrum]);

    const { networksBySyncState } = await mountCrossChainSync();

    expect(networksBySyncState.value).toMatchInlineSnapshot(`
      {
        "synced": [],
        "syncing": [
          42161,
        ],
        "unsynced": [
          10,
          100,
          137,
          1101,
          8453,
          43114,
        ],
      }
    `);
  });
});

test('Calculates L2 network balances', async () => {
  mockOmniEscrowLocks([defaultOmniEscrowLockArbitrum]);
  const { l2VeBalBalances } = await mountCrossChainSync();

  // calculations for the given bias/slope/timestamp given that today is 2023-01-01 (mocked in setup-vitest)
  expect(l2VeBalBalances.value).toMatchInlineSnapshot(`
    {
      "10": "0.0000",
      "100": "0.0000",
      "1101": "0.0000",
      "137": "0.0000",
      "42161": "0.0904",
      "43114": "0.0000",
      "8453": "0.0000",
    }
  `);
});

test('Synchronizes Arbitrum', async () => {
  mockOmniEscrowLocks([]);
  const { sync } = await mountCrossChainSync();

  await sync(Network.ARBITRUM);

  // Estimates unsynched user balance in omniVotingEscrow contract for the right Layer Zero network
  expect(callStaticMock).toHaveBeenCalledOnce();
  const estimationParams = firstCallParams(callStaticMock);
  expect(estimationParams.contractAddress).toBe(
    '0x96484f2aBF5e58b15176dbF1A799627B53F13B6d' //Goerli omniVotingEscrow contract address
  );
  expect(estimationParams.action).toBe('estimateSendUserBalance');
  const LayerZeroArbitrum = 110;
  expect(estimationParams.params).toEqual([LayerZeroArbitrum]);

  // Sends the pending synched user balance in omniVotingEscrow contract for the right Layer Zero network
  expect(sendTransactionMock).toHaveBeenCalledOnce();
  const sendTransactionParams = firstCallParams(sendTransactionMock);
  expect(sendTransactionParams.contractAddress).toBe(
    '0x96484f2aBF5e58b15176dbF1A799627B53F13B6d'
  ); //Goerli omniVotingEscrow contract address
  expect(sendTransactionParams.action).toBe('sendUserBalance');
  expect(sendTransactionParams.params).toEqual([
    defaultWeb3Account.value,
    LayerZeroArbitrum,
    defaultWeb3Account.value,
  ]);
});
