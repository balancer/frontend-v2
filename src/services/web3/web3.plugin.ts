import { MetamaskConnector } from './connectors/metamask/metamask.connector';
import { Connector } from './connectors/connector';
import { computed, reactive, ref, Ref, toRefs } from 'vue';
import { WalletConnectConnector } from './connectors/trustwallet/walletconnect.connector';
import { getAddress } from '@ethersproject/address';
import { lsGet, lsSet } from '@/lib/utils';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider
} from '@ethersproject/providers';
import { GnosisSafeConnector } from './connectors/gnosis/gnosis.connector';
import { WalletLinkConnector } from './connectors/walletlink/walletlink.connector';
import { PortisConnector } from './connectors/portis/portis.connector';
import useFathom from '@/composables/useFathom';

import defaultLogo from '@/assets/images/connectors/default.svg';
import fortmaticLogo from '@/assets/images/connectors/fortmatic.svg';
import frameLogo from '@/assets/images/connectors/frame.svg';
import imtokenLogo from '@/assets/images/connectors/imtoken.svg';
import metamaskLogo from '@/assets/images/connectors/metamask.svg';
import portisLogo from '@/assets/images/connectors/portis.svg';
import statusLogo from '@/assets/images/connectors/status.svg';
import trustwalletLogo from '@/assets/images/connectors/trustwallet.svg';
import walletconnectLogo from '@/assets/images/connectors/walletconnect.svg';
import walletlinkLogo from '@/assets/images/connectors/walletlink.svg';
import i18n from '@/plugins/i18n';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';

export type Wallet =
  | 'metamask'
  | 'walletconnect'
  | 'gnosis'
  | 'walletlink'
  | 'portis';
export const SupportedWallets = [
  'metamask',
  'walletconnect',
  'gnosis',
  'walletlink',
  'portis'
] as Wallet[];
export const WalletNameMap: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'WalletConnect',
  gnosis: 'Gnosis Safe',
  walletlink: 'Coinbase',
  portis: 'Portis'
};
type ConnectorImplementation = new (...args: any[]) => Connector;
export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');

export type Web3Plugin = {
  connectWallet: (wallet: Wallet) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: Ref<Web3Provider | JsonRpcProvider>;
  account: Ref<string>;
  chainId: Ref<number>;
  connector: Ref<Connector>;
  walletState: Ref<WalletState>;
  signer: Ref<JsonRpcSigner>;
};

const WalletConnectorDictionary: Record<Wallet, ConnectorImplementation> = {
  metamask: MetamaskConnector,
  walletconnect: WalletConnectConnector,
  gnosis: GnosisSafeConnector,
  walletlink: WalletLinkConnector,
  portis: PortisConnector
};

type WalletState = 'connecting' | 'connected' | 'disconnected';
type PluginState = {
  connector: any;
  walletState: WalletState;
};

export default {
  install: async app => {
    const { trackGoal, Goals } = useFathom();
    const alreadyConnectedAccount = ref(lsGet('connectedWallet', null));
    const alreadyConnectedProvider = ref(lsGet('connectedProvider', null));
    // this data provided is properly typed to all consumers
    // via the 'Web3Provider' type
    const pluginState = reactive<PluginState>({
      connector: null as any,
      walletState: 'disconnected'
    });

    const account = computed(() => {
      if (pluginState.connector && pluginState.connector.account) {
        // always want to be using checksum addresses
        return getAddress(pluginState.connector.account);
      }
      return '';
    });

    const chainId = computed(() => {
      return pluginState.connector?.chainId;
    });

    const provider = computed(
      () =>
        pluginState.connector?.provider ??
        rpcProviderService.getJsonProvider(chainId.value.toString())
    );
    const signer = computed(() => pluginState.connector?.provider?.getSigner());

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
          alreadyConnectedAccount.value
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
        if (account.value) {
          lsSet('connectedWallet', account.value);
          lsSet('connectedProvider', wallet);
          pluginState.walletState = 'connected';

          trackGoal(Goals.ConnectedWallet);
        }
      } catch (err) {
        console.error(err);
        pluginState.walletState = 'disconnected';
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
      pluginState.walletState = 'disconnected';
      alreadyConnectedAccount.value = null;
      alreadyConnectedProvider.value = null;
    };

    // previously connected wallet initiation
    if (alreadyConnectedAccount.value && alreadyConnectedProvider.value) {
      connectWallet(alreadyConnectedProvider.value);
    }

    const payload: Web3Plugin = {
      connectWallet,
      disconnectWallet,
      ...toRefs(pluginState),
      account,
      chainId,
      provider,
      signer
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};

export function getConnectorName(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum as any;
    if (provider.isMetaMask) {
      return 'MetaMask';
    }
    if (provider.isImToken) {
      return 'imToken';
    }
    if (provider.isStatus) {
      return 'Status';
    }
    if (provider.isTrust) {
      return 'Trust Wallet';
    }
    if (provider.isFrame) {
      return 'Frame';
    }
    return i18n.global.t('browserWallet');
  }
  if (connectorId === 'fortmatic') {
    return 'Fortmatic';
  }
  if (connectorId === 'portis') {
    return 'Portis';
  }
  if (connectorId === 'walletconnect') {
    return 'WalletConnect';
  }
  if (connectorId === 'walletlink') {
    return `Coinbase ${i18n.global.t('wallet')}`;
  }
  if (connectorId === 'gnosis') {
    return 'Gnosis Safe';
  }
  return i18n.global.t('unknown');
}

export function getConnectorLogo(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum as any;
    if (provider.isMetaMask) {
      return metamaskLogo;
    }
    if (provider.isImToken) {
      return imtokenLogo;
    }
    if (provider.isStatus) {
      return statusLogo;
    }
    if (provider.isTrust) {
      return trustwalletLogo;
    }
    if (provider.isFrame) {
      return frameLogo;
    }
    return defaultLogo;
  }
  if (connectorId === 'fortmatic') {
    return fortmaticLogo;
  }
  if (connectorId === 'portis') {
    return portisLogo;
  }
  if (connectorId === 'walletconnect') {
    return walletconnectLogo;
  }
  if (connectorId === 'walletlink') {
    return walletlinkLogo;
  }
  return defaultLogo;
}
