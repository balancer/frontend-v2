import { Network } from '@/lib/config';
import { useOmniEscrowLocksQuery } from '../queries/useOmniEscrowLocksQuery';
import { useVotingEscrowLocksQuery } from '../queries/useVotingEscrowQuery';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import { OmniVotingEscrow } from '@/services/balancer/contracts/contracts/omni-voting-escrow';
import { allEqual } from '@/lib/utils/array';
import BigNumber from 'bignumber.js';
import { txResponseMock } from '@/__mocks__/transactions';

export enum NetworkSyncState {
  Unsynced = 'Unsynced',
  Syncing = 'Syncing',
  Synced = 'Synced',
}

interface EscrowLockData {
  bias?: string;
  slope?: string;
}

export interface NetworksBySyncState {
  synced: Network[];
  unsynced: Network[];
  syncing: Network[];
}

export type L2VeBalBalances = Record<number, string> | null;

export interface TempSyncingNetworks {
  networks: Network[];
  syncTimestamp?: number;
}

// all networks that are supported by cross-chain sync feature
export const allNetworks = [
  Network.POLYGON,
  Network.ARBITRUM,
  Network.GNOSIS,
  Network.OPTIMISM,
];

// https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
export const LayerZeroNetworkId = {
  [Network.POLYGON]: 109,
  [Network.ARBITRUM]: 110,
  [Network.OPTIMISM]: 111,
  [Network.GNOSIS]: 145,
};

const REFETCH_INTERVAL = 10_000;

export function useCrossChainSync() {
  const { account, getSigner } = useWeb3();

  const syncingNetworksFromStorage = localStorage.getItem(
    'tempSyncingNetworks'
  );

  // as subgraph is lagging behind onchain data, we need to fake synced networks
  const tempSyncingNetworks = ref<Record<string, TempSyncingNetworks>>(
    syncingNetworksFromStorage ? JSON.parse(syncingNetworksFromStorage) : {}
  );

  /**
   * omniVotingEscrowLocks contains the user's veBAL data that is known by the bridge contract
   * it is used to determine sync status to l2 networks
   * slope and bias is how a user's "balance" is stored on the smart contract
   */
  const {
    data: omniEscrowResponse,
    isInitialLoading: isLoadingOmniEscrow,
    isRefetching: isRefetchingOmniEscrow,
    refetch: refetchOmniEscrow,
  } = useOmniEscrowLocksQuery(account);

  // if omniEscrowLocks is empty, then all networks are unsynced
  const allNetworksUnsynced = computed(
    () => omniEscrowResponse.value?.omniVotingEscrowLocks.length === 0
  );

  const omniEscrowLocks = computed(() => {
    if (allNetworksUnsynced.value) return null;

    const omniVotingEscrowLocks =
      omniEscrowResponse.value?.omniVotingEscrowLocks[0];
    return omniVotingEscrowLocks;
  });

  /**
   * smart contracts can direct their veBAL boost to a different address on L2
   * for regular UI users, remoteUser will be the same as localUser
   */
  const remoteUser = computed(() => {
    return omniEscrowLocks.value?.remoteUser;
  });

  /**
   * votingEscrowLocks contains the user's original veBAL data
   * slope and bias is how a user's "balance" is stored on the smart contract
   */
  const {
    data: mainnetVotingEscrowResponse,
    isInitialLoading: isLoadingVotingEscrow,
    isRefetching: isRefetchingVotingEscrow,
    refetch: refetchVotingEscrow,
  } = useVotingEscrowLocksQuery(Network.MAINNET, account);

  const {
    data: arbitrumVotingEscrowResponse,
    refetch: refetchVotingEscrowArbitrum,
  } = useVotingEscrowLocksQuery(Network.ARBITRUM, remoteUser);

  const {
    data: polygonVotingEscrowResponse,
    refetch: refetchVotingEscrowPolygon,
  } = useVotingEscrowLocksQuery(Network.POLYGON, remoteUser);

  const votingEscrowLocks = computed(() => {
    const votingEscrowLocks =
      mainnetVotingEscrowResponse.value?.votingEscrowLocks[0];
    const votingEscrowLocksArbitrum =
      arbitrumVotingEscrowResponse.value?.votingEscrowLocks[0];
    const votingEscrowLocksPolygon =
      polygonVotingEscrowResponse.value?.votingEscrowLocks[0];

    return {
      [Network.MAINNET]: votingEscrowLocks,
      [Network.ARBITRUM]: votingEscrowLocksArbitrum,
      [Network.POLYGON]: votingEscrowLocksPolygon,
    };
  });

  const isLoading = computed(() => {
    return (
      isLoadingOmniEscrow.value ||
      // isRefetchingOmniEscrow.value ||
      isLoadingVotingEscrow.value
      // isRefetchingVotingEscrow.value
    );
  });

  const networksSyncState = computed(() => {
    if (allNetworksUnsynced.value) {
      return {
        [Network.ARBITRUM]: NetworkSyncState.Unsynced,
        [Network.OPTIMISM]: NetworkSyncState.Unsynced,
        [Network.GNOSIS]: NetworkSyncState.Unsynced,
        [Network.POLYGON]: NetworkSyncState.Unsynced,
      };
    }

    if (isLoading.value) {
      return null;
    }

    const bias = omniEscrowLocks.value?.bias;
    const slope = omniEscrowLocks.value?.slope;

    const biasVotingEscrow = votingEscrowLocks.value[Network.MAINNET]?.bias;
    const slopeVotingEscrow = votingEscrowLocks.value[Network.MAINNET]?.slope;

    const biasVotingEscrowArb = votingEscrowLocks.value[Network.ARBITRUM]?.bias;
    const slopeVotingEscrowArb =
      votingEscrowLocks.value[Network.ARBITRUM]?.slope;

    const biasVotingEscrowPolygon =
      votingEscrowLocks.value[Network.POLYGON]?.bias;
    const slopeVotingEscrowPolygon =
      votingEscrowLocks.value[Network.POLYGON]?.slope;

    return {
      [Network.ARBITRUM]: getNetworkSyncState(
        { bias, slope },
        { bias: biasVotingEscrow, slope: slopeVotingEscrow },
        { bias: biasVotingEscrowArb, slope: slopeVotingEscrowArb }
      ),
      [Network.POLYGON]: getNetworkSyncState(
        { bias, slope },
        { bias: biasVotingEscrow, slope: slopeVotingEscrow },
        { bias: biasVotingEscrowPolygon, slope: slopeVotingEscrowPolygon }
      ),
    };
  });

  function getNetworkSyncState(
    omniEscrowData: EscrowLockData,
    votingEscrowMainnet: EscrowLockData,
    votingEscrowNetwork: EscrowLockData
  ) {
    if (
      !omniEscrowData.slope ||
      !votingEscrowMainnet.slope ||
      !votingEscrowNetwork.slope
    )
      return NetworkSyncState.Unsynced;

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

    return NetworkSyncState.Unsynced;
  }

  // Returns networks lists by sync state synced/unsynced
  const networksBySyncState = computed<NetworksBySyncState>(() => {
    if (!networksSyncState.value) {
      return {
        synced: [],
        unsynced: [],
        syncing: [],
      };
    }

    const nArr = Object.keys(networksSyncState.value).map(v => Number(v));

    return {
      synced: nArr.filter(
        network =>
          networksSyncState.value?.[network] === NetworkSyncState.Synced
      ) as Network[],
      unsynced: nArr.filter(
        network =>
          networksSyncState.value?.[network] === NetworkSyncState.Unsynced
      ),
      syncing: nArr.filter(
        network =>
          networksSyncState.value?.[network] === NetworkSyncState.Syncing ||
          tempSyncingNetworks.value[account.value]?.networks.includes(network)
      ),
    };
  });

  // veBAL_balance = bias - slope * (now() - timestamp)
  function calculateVeBAlBalance(
    bias?: string,
    slope?: string,
    timestamp?: number
  ) {
    if (!bias || !slope || !timestamp)
      return new BigNumber(0).toFixed(4).toString();

    const x = new BigNumber(slope).multipliedBy(
      Math.floor(Date.now() / 1000) - timestamp
    );

    if (x.isLessThan(0)) return new BigNumber(bias).toFixed(4).toString();

    return new BigNumber(bias).minus(x).toFixed(4).toString();
  }

  const l2VeBalBalances = computed<L2VeBalBalances>(() => {
    const biasArb = votingEscrowLocks.value[Network.ARBITRUM]?.bias;
    const slopeArb = votingEscrowLocks.value[Network.ARBITRUM]?.slope;
    const timestampArb = votingEscrowLocks.value[Network.ARBITRUM]?.timestamp;

    const biasPolygon = votingEscrowLocks.value[Network.POLYGON]?.bias;
    const slopePolygon = votingEscrowLocks.value[Network.POLYGON]?.slope;
    const timestampPolygon =
      votingEscrowLocks.value[Network.POLYGON]?.timestamp;

    return {
      [Network.ARBITRUM]: calculateVeBAlBalance(
        biasArb,
        slopeArb,
        timestampArb
      ),
      [Network.POLYGON]: calculateVeBAlBalance(
        biasPolygon,
        slopePolygon,
        timestampPolygon
      ),
    };
  });

  async function sync(network: Network) {
    const contractAddress = configService.network.addresses.omniVotingEscrow;
    if (!contractAddress) throw new Error('No contract address found');
    const signer = getSigner();
    const omniVotingEscrowContract = new OmniVotingEscrow(contractAddress);

    const tx = await omniVotingEscrowContract.estimateSendUserBalance(
      signer,
      LayerZeroNetworkId[network]
    );

    const { nativeFee } = tx;
    console.log('nativeFee', nativeFee);

    // const sendUserBalanceTx = await omniVotingEscrowContract.sendUserBalance({
    //   signer,
    //   userAddress: account.value,
    //   chainId: LayerZeroNetworkId[network],
    //   nativeFee,
    // });

    // console.log('sendUserBalanceTx', sendUserBalanceTx);
    return txResponseMock;
  }

  async function refetch() {
    await Promise.all([refetchOmniEscrow(), refetchVotingEscrow()]);
    if (remoteUser.value) {
      const promises = networksBySyncState.value.syncing.map(network => {
        if (network === Network.ARBITRUM) {
          return refetchVotingEscrowArbitrum();
        }
        if (network === Network.POLYGON) {
          return refetchVotingEscrowPolygon();
        }
      });
      await Promise.all(promises);
    }
  }

  let disposeRefetchOnInterval;
  function refetchOnInterval() {
    disposeRefetchOnInterval = setInterval(() => {
      void refetch();
    }, REFETCH_INTERVAL);

    return () => {
      clearInterval(disposeRefetchOnInterval);
    };
  }

  function setTempSyncingNetwors(syncingNetworks: Network[]) {
    if (!tempSyncingNetworks.value[account.value]) {
      tempSyncingNetworks.value[account.value] = {
        networks: syncingNetworks,
        syncTimestamp: Date.now(),
      };
    } else {
      tempSyncingNetworks.value[account.value].networks = [
        ...tempSyncingNetworks.value[account.value].networks,
        ...syncingNetworks,
      ];
    }

    tempSyncingNetworks.value[account.value].syncTimestamp = Date.now();

    return tempSyncingNetworks.value;
  }

  function clearTempSyncingNetworks() {
    tempSyncingNetworks.value[account.value].networks =
      tempSyncingNetworks.value[account.value].networks.filter(network => {
        return !networksBySyncState.value.synced.includes(network);
      });
  }

  watch(
    () => networksBySyncState.value,
    (newVal, prevVal) => {
      console.log('newVal', newVal);
      console.log('prevVal', prevVal);

      if (newVal.syncing.length > 0 && !disposeRefetchOnInterval) {
        refetchOnInterval();
      }
      if (newVal.syncing.length === 0 && disposeRefetchOnInterval) {
        disposeRefetchOnInterval();
      }

      clearTempSyncingNetworks();
    }
  );

  return {
    omniEscrowLocks,
    votingEscrowLocks,
    networksSyncState,
    isLoading,
    networksBySyncState,
    l2VeBalBalances,
    sync,
    refetch,
    tempSyncingNetworks,
    refetchOnInterval,
    setTempSyncingNetwors,
  };
}
