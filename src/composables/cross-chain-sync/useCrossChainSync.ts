import { Network } from '@/lib/config';
import {
  OmniEscrowLock,
  useOmniEscrowLocksQuery,
} from '../queries/useOmniEscrowLocksQuery';
import { useVotingEscrowLocksQuery } from '../queries/useVotingEscrowQuery';
import useWeb3 from '@/services/web3/useWeb3';
import { VotingEscrowLock } from '../useVotingEscrowLocks';
import { configService } from '@/services/config/config.service';
import { OmniVotingEscrow } from '@/services/balancer/contracts/contracts/omni-voting-escrow';

export enum NetworkSyncState {
  Unsync = 'Unsync',
  Syncing = 'Syncing',
  Synced = 'Synced',
}

interface EscrowLockData {
  bias: string;
  slope: string;
}

function allEqual<T>(array: T[]): boolean {
  return array.every(value => value === array[0]);
}

export function useCrossChainSync() {
  const { account } = useWeb3();

  const { data: omniEscrowResponse, isLoading: isLoadingOmniEscrow } =
    useOmniEscrowLocksQuery(account);

  const omniEscrowLocks = computed(() => {
    const omniVotingEscrowLocks =
      omniEscrowResponse.value?.omniVotingEscrowLocks[0];
    console.log('omniVotingEscrowLocks', omniVotingEscrowLocks);
    return omniVotingEscrowLocks;
  });

  const remoteUser = computed(() => {
    return omniEscrowLocks.value?.remoteUser;
  });

  const {
    data: mainnetVotingEscrowResponse,
    isLoading: isLoadingVotingEscrow,
  } = useVotingEscrowLocksQuery(
    Network.MAINNET,
    computed(() => '0x4a30c80a2c41312ce4ee79f730c8d84cad9f7b31')
  );
  const {
    data: arbitrumVotingEscrowResponse,
    isLoading: isLoadingVotingEscrowArbitrum,
  } = useVotingEscrowLocksQuery(Network.ARBITRUM, remoteUser);

  const votingEscrowLocks = computed(() => {
    const votingEscrowLocks =
      mainnetVotingEscrowResponse.value?.votingEscrowLocks[0];
    const votingEscrowLocksArbitrum =
      arbitrumVotingEscrowResponse.value?.votingEscrowLocks[0];
    console.log('votingEscrowLocksArbitrum', votingEscrowLocksArbitrum);
    console.log('votingEscrowLocks', votingEscrowLocks);
    return {
      [Network.MAINNET]: votingEscrowLocks,
      [Network.ARBITRUM]: votingEscrowLocksArbitrum,
    };
  });

  const isLoading = computed(() => {
    return (
      isLoadingOmniEscrow.value ||
      isLoadingVotingEscrow.value ||
      isLoadingVotingEscrowArbitrum.value
    );
  });

  const networksSyncState = computed(() => {
    if (
      isLoading.value ||
      !omniEscrowLocks.value ||
      !votingEscrowLocks.value?.[Network.MAINNET] ||
      !votingEscrowLocks.value?.[Network.ARBITRUM]
    ) {
      return {};
    }

    const { bias, slope } = omniEscrowLocks.value;
    const { bias: biasVotingEscrow, slope: slopeVotingEscrow } =
      votingEscrowLocks.value[Network.MAINNET];

    const { bias: biasVotingEscrowArb, slope: slopeVotingEscrowArb } =
      votingEscrowLocks.value[Network.ARBITRUM];

    return {
      [Network.ARBITRUM]: getNetworkSyncState(
        { bias, slope },
        { bias: biasVotingEscrow, slope: slopeVotingEscrow },
        { bias: biasVotingEscrowArb, slope: slopeVotingEscrowArb }
      ),
    };
  });

  function getNetworkSyncState(
    omniEscrowData: EscrowLockData,
    votingEscrowMainnet: EscrowLockData,
    votingEscrowNetwork: EscrowLockData
  ) {
    const { bias: biasOmniEscrow, slope: slopeOmniEscrow } = omniEscrowData;
    const { bias: biasVotingEscrow, slope: slopeVotingEscrow } =
      votingEscrowMainnet;
    const { bias: biasVotingEscrowNetwork, slope: slopeVotingEscrowNetwork } =
      votingEscrowNetwork;

    const isSynced =
      allEqual([biasOmniEscrow, biasVotingEscrow, biasVotingEscrowNetwork]) &&
      allEqual([slopeOmniEscrow, slopeVotingEscrow, slopeVotingEscrowNetwork]);

    const isSyncing =
      allEqual([biasOmniEscrow, biasVotingEscrow]) &&
      allEqual([slopeOmniEscrow, slopeVotingEscrow]) &&
      slopeOmniEscrow !== slopeVotingEscrowNetwork &&
      biasOmniEscrow !== biasVotingEscrowNetwork;

    if (isSynced) {
      return NetworkSyncState.Synced;
    }
    if (isSyncing) {
      return NetworkSyncState.Syncing;
    }

    return NetworkSyncState.Unsync;
  }

  const syncUnsyncState = computed(() => {
    if (!networksSyncState.value) return {};

    return {
      synced: Object.keys(networksSyncState.value).filter(
        network =>
          networksSyncState.value?.[network] === NetworkSyncState.Synced
      ),
      unsynced: Object.keys(networksSyncState.value).filter(
        network =>
          networksSyncState.value?.[network] === NetworkSyncState.Unsync ||
          networksSyncState.value?.[network] === NetworkSyncState.Syncing
      ),
    };
  });

  async function sync() {
    const contractAddress = configService.network.addresses.omniVotingEscrow;
    if (!contractAddress) throw new Error('No contract address found');

    const omniVotingEscrowContract = new OmniVotingEscrow(contractAddress);
    try {
      const tx = await omniVotingEscrowContract.estimateSendUserBalance(137);

      console.log('tx', tx);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    omniEscrowLocks,
    votingEscrowLocks,
    networksSyncState,
    isLoading,
    syncUnsyncState,
    sync,
  };
}
