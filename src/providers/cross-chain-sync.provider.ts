import { Network } from '@/lib/config/types';

import { useCrossChainNetwork } from '@/composables/queries/useCrossChainNetwork';
import {
  OmniEscrowLock,
  useOmniEscrowLocksQuery,
} from '@/composables/queries/useOmniEscrowLocksQuery';
import symbolKeys from '@/constants/symbol.keys';
import { OmniVotingEscrow } from '@/services/balancer/contracts/contracts/omni-voting-escrow';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { safeInject } from './inject';
import configs from '@/lib/config';
import { GaugeWorkingBalanceHelper } from '@/services/balancer/contracts/contracts/gauge-working-balance-helper';
import { useI18n } from 'vue-i18n';
import { getMessagesBySrcTxHash } from '@layerzerolabs/scan-client';
import { isPoolBoostsEnabled } from '@/composables/useNetwork';

export enum NetworkSyncState {
  Unsynced = 'Unsynced',
  Syncing = 'Syncing',
  Synced = 'Synced',
  Unknown = 'Unknown',
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

export interface SyncTxHashes {
  [key: string]: string;
}

// all networks that are supported by cross-chain sync feature
export const veBalSyncSupportedNetworks = Object.keys(configs)
  .filter(key => configs[Number(key)].supportsVeBalSync)
  .map(key => Number(key));

const REFETCH_INTERVAL = 1000 * 30; // 30 seconds
const REFETCH_GET_LAYER_ZERO_TX_LINKS_INTERVAL = 1000 * 5;

export const crossChainSyncProvider = () => {
  const { account, getSigner } = useWeb3();
  const { t } = useI18n();

  const syncingNetworksFromStorage = localStorage.getItem(
    'tempSyncingNetworks'
  );

  // as subgraph is lagging behind onchain data, we need to fake synced networks
  const tempSyncingNetworks = ref<Record<string, TempSyncingNetworks>>(
    syncingNetworksFromStorage ? JSON.parse(syncingNetworksFromStorage) : {}
  );

  const syncTxHashesFromStorage = localStorage.getItem('syncTxHashes');

  const syncTxHashes = ref<Record<string, SyncTxHashes>>(
    syncTxHashesFromStorage ? JSON.parse(syncTxHashesFromStorage) : {}
  );

  const syncLayerZeroTxLinks = ref<Record<string, string>>({});

  /**
   * omniVotingEscrowLocks contains the user's veBAL data that is known by the bridge contract
   * it is used to determine sync status to l2 networks
   * slope and bias is how a user's "balance" is stored on the smart contract
   */
  const {
    data: omniEscrowResponse,
    isInitialLoading: isLoadingOmniEscrow,
    refetch: refetchOmniEscrow,
    isError: isOmniEscrowError,
  } = useOmniEscrowLocksQuery(account);

  // if omniEscrowLocks is empty, then all networks are unsynced
  const allNetworksUnsynced = computed(
    () => omniEscrowResponse.value?.omniVotingEscrowLocks.length === 0
  );

  const omniEscrowLocksMap = computed(() => {
    if (allNetworksUnsynced.value || !omniEscrowResponse.value) return null;

    return omniEscrowResponse.value.omniVotingEscrowLocks.reduce(
      (acc: Record<number, OmniEscrowLock>, item) => {
        acc[item.dstChainId] = item;
        return acc;
      },
      {}
    );
  });

  const mainnetCrossChainNetwork = useCrossChainNetwork(
    Network.MAINNET,
    omniEscrowLocksMap
  );

  const mainnetEscrowLocks = computed(
    () => mainnetCrossChainNetwork.votingEscrowLocks.value
  );

  type UseCrossChainNetworkResponse = Record<
    Network,
    ReturnType<typeof useCrossChainNetwork>
  >;
  const crossChainNetworks: UseCrossChainNetworkResponse =
    {} as UseCrossChainNetworkResponse;

  veBalSyncSupportedNetworks.forEach(networkId => {
    crossChainNetworks[networkId] = useCrossChainNetwork(
      networkId,
      omniEscrowLocksMap
    );
  });

  const isLoading = computed(() => {
    return (
      isLoadingOmniEscrow.value || mainnetCrossChainNetwork.isLoading.value
    );
  });

  const networksSyncState = computed(() => {
    const result = veBalSyncSupportedNetworks.reduce((acc, network) => {
      acc[network] = crossChainNetworks[network].getNetworkSyncState(
        omniEscrowLocksMap.value?.[configs[network].layerZeroChainId || ''],
        mainnetEscrowLocks.value
      );
      return acc;
    }, {});
    return result;
  });

  // Returns networks lists by sync state
  const networksBySyncState = computed<NetworksBySyncState>(() => {
    if (!networksSyncState.value) {
      return {
        synced: [],
        unsynced: [],
        syncing: [],
      };
    }

    const networksWithValidSyncState = Object.keys(networksSyncState.value).map(
      v => Number(v)
    );

    return {
      synced: networksWithValidSyncState.filter(
        network => networksSyncState.value[network] === NetworkSyncState.Synced
      ) as Network[],
      unsynced: networksWithValidSyncState.filter(
        network =>
          networksSyncState.value[network] === NetworkSyncState.Unsynced
      ),
      syncing: networksWithValidSyncState.filter(
        network =>
          networksSyncState.value[network] === NetworkSyncState.Syncing ||
          tempSyncingNetworks.value[account.value]?.networks.includes(network)
      ),
    };
  });

  // List of networks to show in unsynced networks card
  const showingUnsyncedNetworks = computed(() => {
    const commonArr = [
      ...networksBySyncState.value.unsynced,
      ...networksBySyncState.value.syncing,
    ];
    return [...new Set(commonArr)];
  });

  const hasError = computed(() => {
    const hasVotingEscrowError = veBalSyncSupportedNetworks.some(network => {
      return crossChainNetworks[network].isError.value;
    });
    return isOmniEscrowError.value || hasVotingEscrowError;
  });

  const l2VeBalBalances = computed<L2VeBalBalances>(() => {
    const result = veBalSyncSupportedNetworks.reduce((acc, network) => {
      acc[network] = crossChainNetworks[network].calculateVeBAlBalance();
      return acc;
    }, {});
    return result;
  });

  const warningMessage = computed(() => {
    if (networksBySyncState.value.syncing.length > 0) {
      return {
        title: t('crossChainBoost.syncProcessWarning.title'),
        text: t('crossChainBoost.syncProcessWarning.description'),
      };
    }

    return null;
  });

  const infoMessage = computed(() => {
    if (warningMessage.value) {
      return null;
    }

    if (networksBySyncState.value.synced.length > 0) {
      return {
        title: t('crossChainBoost.updateGauge.title'),
        text: t('crossChainBoost.updateGauge.description'),
      };
    }

    return null;
  });

  async function sync(network: Network) {
    const contractAddress = configService.network.addresses.omniVotingEscrow;
    if (!contractAddress) throw new Error('No contract address found');
    const signer = getSigner();
    const omniVotingEscrowContract = new OmniVotingEscrow(contractAddress);

    const layerZeroChainId = configs[network].layerZeroChainId;

    if (!layerZeroChainId) {
      throw new Error('Must specify layer zero chain id');
    }

    const tx = await omniVotingEscrowContract.estimateSendUserBalance(
      signer,
      layerZeroChainId
    );

    const { nativeFee } = tx;

    const sendUserBalanceTx = await omniVotingEscrowContract.sendUserBalance({
      signer,
      userAddress: account.value,
      chainId: layerZeroChainId,
      nativeFee,
    });

    return sendUserBalanceTx;
  }

  async function refetch() {
    await Promise.all([
      refetchOmniEscrow(),
      mainnetCrossChainNetwork.refetch(),
    ]);
    if (omniEscrowLocksMap.value) {
      const promises = networksBySyncState.value.syncing.map(networkId => {
        return crossChainNetworks[networkId].refetch();
      });
      await Promise.all(promises);
    }
  }

  let disposeRefetchOnInterval: NodeJS.Timeout;
  function refetchOnInterval() {
    disposeRefetchOnInterval = setInterval(() => {
      void refetch();
    }, REFETCH_INTERVAL);
  }

  function setTempSyncingNetworks(syncingNetworks: Network[]) {
    if (!tempSyncingNetworks.value?.[account.value]) {
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

  async function setSyncTxHashes(network: Network, txHash: string) {
    syncTxHashes.value[account.value] = {
      ...syncTxHashes.value[account.value],
      [network]: txHash,
    };

    localStorage.setItem('syncTxHashes', JSON.stringify(syncTxHashes.value));
  }

  function clearTempSyncingNetworksFromSynced() {
    if (!tempSyncingNetworks.value[account.value]) return;

    tempSyncingNetworks.value[account.value].networks =
      tempSyncingNetworks.value[account.value].networks.filter(network => {
        return !networksBySyncState.value.synced.includes(network);
      });

    localStorage.setItem(
      'tempSyncingNetworks',
      JSON.stringify(tempSyncingNetworks.value)
    );
  }

  async function getGaugeWorkingBalance(gaugeAddress: string) {
    if (!isPoolBoostsEnabled.value) return;

    const contractAddress =
      configService.network.addresses.gaugeWorkingBalanceHelper;
    if (!contractAddress) throw new Error('No contract address found');

    const signer = getSigner();
    const workingBalanceHelperContract = new GaugeWorkingBalanceHelper(
      contractAddress
    );

    return workingBalanceHelperContract.getWorkingBalanceToSupplyRatios({
      signer,
      userAddress: account.value,
      gauge: gaugeAddress,
    });
  }

  async function shouldPokeGauge(gaugeAddress: string) {
    const balance = await getGaugeWorkingBalance(gaugeAddress);

    /*
     *  balance[0] is ratio of the current `working_balance` of the user to the current `working_supply` of the gauge
     *  balance[1] is ratio of the projected `working_balance` of the user (after `user_checkpoint`), to the projected `working_supply` of the gauge
     *
     *  so if balance[1] > balance[0] then the user should poke the gauge
     */
    return balance && balance[1]?.gt(balance[0]);
  }

  async function getLayerZeroTxLink(txHash: string) {
    const { messages } = await getMessagesBySrcTxHash(101, txHash);
    const message = messages[0];

    if (!message) {
      console.error('No message found in Layer Zero');
      return '';
    }

    const { srcTxHash } = message;

    const link = `https://layerzeroscan.com/tx/${srcTxHash}`;
    return link;
  }

  watch(
    () => networksBySyncState.value,
    newVal => {
      if (newVal.synced.length > 0) {
        const hasSyncingMismatch = newVal.syncing.some(network => {
          return newVal.synced.includes(network);
        });

        if (hasSyncingMismatch) {
          clearTempSyncingNetworksFromSynced();
        }
      }

      if (newVal.syncing.length > 0 && !disposeRefetchOnInterval) {
        refetchOnInterval();
      }
      if (newVal.syncing.length === 0 && disposeRefetchOnInterval) {
        clearInterval(disposeRefetchOnInterval);
      }
    }
  );

  let disposeRefetchLayerZeroTxLink: NodeJS.Timeout;
  function getLayerZeroTxLinkOnInterval(networks: string[]) {
    if (disposeRefetchLayerZeroTxLink) {
      clearInterval(disposeRefetchLayerZeroTxLink);
    }
    let retryCount = 0;
    disposeRefetchLayerZeroTxLink = setInterval(async () => {
      for (const network of networks) {
        const hash = syncTxHashes.value[account.value][network];
        syncLayerZeroTxLinks.value[network] = await getLayerZeroTxLink(hash);
      }

      retryCount++;

      if (
        networks.every(network => syncLayerZeroTxLinks.value[network]) ||
        retryCount > 10
      ) {
        clearInterval(disposeRefetchLayerZeroTxLink);
      }
    }, REFETCH_GET_LAYER_ZERO_TX_LINKS_INTERVAL);
  }

  watch(
    () => [syncTxHashes.value, account.value],
    async values => {
      const val = values[0];
      if (!val || !val[account.value]) return;

      getLayerZeroTxLinkOnInterval(Object.keys(val[account.value]));
    },
    { immediate: true, deep: true }
  );

  return {
    showingUnsyncedNetworks,
    hasError,
    omniEscrowLocksMap,
    networksSyncState,
    isLoading,
    networksBySyncState,
    l2VeBalBalances,
    sync,
    refetch,
    tempSyncingNetworks,
    refetchOnInterval,
    setTempSyncingNetworks,
    warningMessage,
    infoMessage,
    getGaugeWorkingBalance,
    getLayerZeroTxLink,
    syncTxHashes,
    setSyncTxHashes,
    syncLayerZeroTxLinks,
    shouldPokeGauge,
  };
};

export type CrossChainSyncResponse = ReturnType<typeof crossChainSyncProvider>;
export const CrossChainSyncProviderSymbol: InjectionKey<CrossChainSyncResponse> =
  Symbol(symbolKeys.Providers.CrossChainSync);

export function provideCrossChainSync() {
  const crossChainSyncResponse = crossChainSyncProvider();
  provide(CrossChainSyncProviderSymbol, crossChainSyncResponse);
  return crossChainSyncResponse;
}

export const useCrossChainSync = (): CrossChainSyncResponse => {
  return safeInject(CrossChainSyncProviderSymbol);
};
