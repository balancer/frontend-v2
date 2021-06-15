import { MetamaskConnector } from './connectors/metamask/metamask.connector';
import { Connector } from './connectors/connector';
import { computed, reactive, Ref, toRefs } from 'vue';
import { AbstractProvider } from 'web3-core';
import { WalletConnectConnector } from './connectors/trustwallet/walletconnect.connector';
import { getAddress } from '@ethersproject/address';

type Wallet = 'metamask' | 'walletconnect';
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
  install: (app, Web3Library) => {
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
      const connector = new WalletConnectorDictionary[wallet]();
      if (!connector) {
        throw new Error(
          `Wallet [${wallet}] is not supported yet. Please contact the dev team to add this connector.`
        );
      }
      const { provider } = await connector.connect();

      // listens to wallet/chain changed and disconnect events
      connector.registerListeners();

      providerData.provider = new Web3Library(provider);
      // it is handy to provide the connector instance
      providerData.connector = connector;
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
    };

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
