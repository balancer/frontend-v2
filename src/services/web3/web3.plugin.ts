import { MetamaskConnector } from './connectors/metamask/metamask.connector';
import { Connector } from './connectors/connector';
import { computed, reactive, Ref, toRefs } from 'vue';
import { AbstractProvider } from 'web3-core';
import { WalletConnectConnector } from './connectors/trustwallet/walletconnect.connector';
import { getAddress } from '@ethersproject/address';
import { lsGet, lsSet } from '@/lib/utils';

export type Wallet = 'metamask' | 'walletconnect';
export const SupportedWallets = ['metamask', 'walletconnect'] as Wallet[];
export const WalletNameDictionary: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'Wallet Connect'
};
type ConnectorImplementation = new (...args: any[]) => Connector;
export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');

export type Web3Provider = {
  connectWallet: (wallet: Wallet) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: AbstractProvider;
  account: Ref<string>;
  chainId: Ref<number>;
  connector: Ref<Connector>;
};

const WalletConnectorDictionary: Record<Wallet, ConnectorImplementation> = {
  metamask: MetamaskConnector,
  walletconnect: WalletConnectConnector
};

export default {
  install: async (app, Web3Library) => {
    const alreadyConnectedAccount = lsGet('connectedWallet');
    const alreadyConnectedProvider = lsGet('connectedProvider');
    // this data provided is properly typed to all consumers
    // via the 'Web3Provider' type
    const providerData = reactive({
      provider: null as any,
      connector: null as any
    });

    const account = computed(() => {
      if (providerData.connector) {
        // always want to be using checksum addresses
        return getAddress(providerData.connector.account);
      }
      return '';
    });

    const chainId = computed(() => {
      if (providerData.connector) {
        return providerData.connector.chainId;
      }
      return 0;
    });

    // user supplied web3 provider. i.e. (web3, ethers)
    const connectWallet = async (wallet: Wallet) => {
      if (!wallet || typeof wallet !== 'string') {
        throw new Error(
          'Please provide a wallet to facilitate a web3 connection.'
        );
      }

      // the wallet parameter will be provided by the front-end by means of
      // modal selection or otherwise
      const connector = new WalletConnectorDictionary[wallet](
        alreadyConnectedAccount
      );
      if (!connector) {
        throw new Error(
          `Wallet [${wallet}] is not supported yet. Please contact the dev team to add this connector.`
        );
      }
      const { provider, account } = await connector.connect();

      // listens to wallet/chain changed and disconnect events
      connector.registerListeners();

      providerData.provider = new Web3Library(provider);
      // it is handy to provide the connector instance
      providerData.connector = connector;

      // for when user reloads the app on an already connected wallet
      // need to store address to pre-load that connection
      lsSet('connectedWallet', account.value);
      lsSet('connectedProvider', wallet);
    };

    const disconnectWallet = async () => {
      if (!providerData.connector) {
        throw new Error(
          'Cannot disconnect a wallet. No wallet currently connected.'
        );
      }
      const connector = providerData.connector as Connector;
      connector.handleDisconnect();
      providerData.connector = null;
      // using lsRemove will make make lsGet return an empty
      // object for these values when retrieved, ruining the
      // pre-connected wallet flow
      lsSet('connectedWallet', '');
      lsSet('connectedProvider', '');
    };

    // previously connected wallet initiation
    if (alreadyConnectedAccount && alreadyConnectedProvider) {
      connectWallet(alreadyConnectedProvider);
    }

    const payload: Web3Provider = {
      connectWallet,
      disconnectWallet,
      ...toRefs(providerData),
      account,
      chainId
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};
