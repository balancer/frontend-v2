import { MetamaskConnector } from './connectors/metamask/metamask.connector';
import { Connector } from './connectors/connector';
import { computed, reactive, Ref, toRefs } from 'vue';
import { WalletConnectConnector } from './connectors/trustwallet/walletconnect.connector';
import { getAddress } from '@ethersproject/address';
import { lsGet, lsSet } from '@/lib/utils';
import { Web3Provider } from '@ethersproject/providers';

export type Wallet = 'metamask' | 'walletconnect';
export const SupportedWallets = ['metamask', 'walletconnect'] as Wallet[];
export const WalletNameDictionary: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'Wallet Connect'
};
type ConnectorImplementation = new (...args: any[]) => Connector;
export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');

export type Web3Plugin = {
  connectWallet: (wallet: Wallet) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: Ref<Web3Provider>;
  account: Ref<string>;
  chainId: Ref<number>;
  connector: Ref<Connector>;
  walletState: Ref<WalletState>;
};

const WalletConnectorDictionary: Record<Wallet, ConnectorImplementation> = {
  metamask: MetamaskConnector,
  walletconnect: WalletConnectConnector
};

type WalletState = 'connecting' | 'connected' | 'empty';
type PluginState = {
  connector: any;
  walletState: WalletState;
};

export default {
  install: async app => {
    const alreadyConnectedAccount = lsGet('connectedWallet');
    const alreadyConnectedProvider = lsGet('connectedProvider');
    // this data provided is properly typed to all consumers
    // via the 'Web3Provider' type
    const pluginState = reactive<PluginState>({
      connector: null as any,
      walletState: 'empty'
    });

    const account = computed(() => {
      if (pluginState.connector && pluginState.connector.account) {
        // always want to be using checksum addresses
        return getAddress(pluginState.connector.account);
      }
      return '';
    });

    const chainId = computed(() => {
      if (pluginState.connector) {
        return pluginState.connector.chainId;
      }
      return Number(process.env.VUE_APP_NETWORK);
    });

    const provider = computed(() => pluginState.connector?.provider);

    // user supplied web3 provider. i.e. (web3, ethers)
    const connectWallet = async (wallet: Wallet) => {
      pluginState.walletState = 'connecting';

      try {
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
        const { account } = await connector.connect();

        // listens to wallet/chain changed and disconnect events
        connector.registerListeners();

        // it is handy to provide the connector instance
        pluginState.connector = connector;

        // for when user reloads the app on an already connected wallet
        // need to store address to pre-load that connection
        lsSet('connectedWallet', account.value);
        lsSet('connectedProvider', wallet);
        pluginState.walletState = 'connected';
      } catch (err) {
        console.error(err);
        pluginState.walletState = 'empty';
      }
    };

    const disconnectWallet = async () => {
      if (!pluginState.connector) {
        throw new Error(
          'Cannot disconnect a wallet. No wallet currently connected.'
        );
      }
      const connector = pluginState.connector as Connector;
      connector.handleDisconnect();
      pluginState.connector = null;
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

    const payload: Web3Plugin = {
      connectWallet,
      disconnectWallet,
      ...toRefs(pluginState),
      account,
      chainId,
      provider
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};
