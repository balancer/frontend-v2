import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import { allEqual } from '@/lib/utils/array';
import { NetworkSyncState } from '@/providers/cross-chain-sync.provider';
import { OmniEscrowLock } from './useOmniEscrowLocksQuery';
import {
  VotingEscrowLock,
  useVotingEscrowLocksQuery,
} from './useVotingEscrowQuery';
import useWeb3 from '@/services/web3/useWeb3';
import { bnum } from '@/lib/utils';

export function useCrossChainNetwork(
  networkId: Network,
  omniEscrowMap: ComputedRef<Record<number, OmniEscrowLock> | null>
) {
  const { account } = useWeb3();

  /**
   * smart contracts can direct their veBAL boost to a different address on L2
   * for regular UI users, remoteUser will be the same as localUser
   */
  const remoteUser = computed(() => {
    if (networkId === Network.MAINNET) {
      return account.value;
    }
    const layerZeroChainId = configs[networkId].layerZeroChainId || '';
    return omniEscrowMap.value?.[layerZeroChainId]?.remoteUser;
  });

  /**
   * votingEscrowLocks contains the user's original veBAL data
   * slope and bias is how a user's "balance" is stored on the smart contract
   */
  const {
    data: votingEscrowResponse,
    refetch,
    isError,
    isInitialLoading: isLoading,
  } = useVotingEscrowLocksQuery(networkId, remoteUser);

  const votingEscrowLocks = computed(
    () => votingEscrowResponse.value?.votingEscrowLocks[0]
  );

  function getNetworkSyncState(
    omniEscrowLock?: OmniEscrowLock | null,
    mainnetEscrowLock?: VotingEscrowLock
  ) {
    if (!omniEscrowLock || !mainnetEscrowLock || !votingEscrowLocks.value) {
      return NetworkSyncState.Unsynced;
    }

    const biasOmni = omniEscrowLock.bias;
    const slopeOmni = omniEscrowLock.slope;

    const biasMainnet = mainnetEscrowLock.bias;
    const slopeMainnet = mainnetEscrowLock.slope;

    const biasNetwork = votingEscrowLocks.value.bias;
    const slopeNetwork = votingEscrowLocks.value.slope;

    if (!omniEscrowLock.slope || !mainnetEscrowLock.slope || !slopeNetwork)
      return NetworkSyncState.Unsynced;

    const isSynced =
      allEqual([biasOmni, biasMainnet, biasNetwork]) &&
      allEqual([slopeOmni, slopeMainnet, slopeNetwork]);

    const isSyncing =
      allEqual([biasOmni, biasMainnet]) &&
      allEqual([slopeOmni, slopeMainnet]) &&
      slopeOmni !== slopeNetwork &&
      biasOmni !== biasNetwork;

    if (isSynced) {
      return NetworkSyncState.Synced;
    }

    if (isSyncing) {
      return NetworkSyncState.Syncing;
    }

    return NetworkSyncState.Unsynced;
  }

  // veBAL_balance = bias - slope * (now() - timestamp)
  function calculateVeBAlBalance() {
    const bias = votingEscrowLocks.value?.bias;
    const slope = votingEscrowLocks.value?.slope;
    const timestamp = votingEscrowLocks.value?.timestamp;

    if (!bias || !slope || !timestamp) return bnum(0).toFixed(4).toString();

    const x = bnum(slope).multipliedBy(
      Math.floor(Date.now() / 1000) - timestamp
    );

    if (x.isLessThan(0)) return bnum(bias).toFixed(4).toString();

    const balance = bnum(bias).minus(x);
    if (balance.isLessThan(0)) return bnum(0).toFixed(4).toString();

    return balance.toFixed(4).toString();
  }

  return {
    getNetworkSyncState,
    votingEscrowLocks,
    refetch,
    calculateVeBAlBalance,
    isLoading,
    isError,
  };
}
