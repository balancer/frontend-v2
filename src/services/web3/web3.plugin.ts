import { getAddress } from '@ethersproject/address';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider
} from '@ethersproject/providers';
import axios from 'axios';
import { computed, reactive, Ref, ref, toRefs } from 'vue';

import defaultLogo from '@/assets/images/connectors/default.svg';
import fortmaticLogo from '@/assets/images/connectors/fortmatic.svg';
import frameLogo from '@/assets/images/connectors/frame.svg';
import imtokenLogo from '@/assets/images/connectors/imtoken.svg';
import metamaskLogo from '@/assets/images/connectors/metamask.svg';
import statusLogo from '@/assets/images/connectors/status.svg';
import tallyLogo from '@/assets/images/connectors/tally.svg';
import trustwalletLogo from '@/assets/images/connectors/trustwallet.svg';
import walletconnectLogo from '@/assets/images/connectors/walletconnect.svg';
import walletlinkLogo from '@/assets/images/connectors/walletlink.svg';
import useFathom from '@/composables/useFathom';
import { SANCTIONS_ENDPOINT } from '@/constants/exploits';
import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';

import { rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { Connector } from './connectors/connector';
import { web3Service } from './web3.service';

export type Wallet =
  | 'metamask'
  | 'walletconnect'
  | 'gnosis'
  | 'walletlink'
  | 'tally';
export const SupportedWallets = [
  'metamask',
  'walletconnect',
  'tally',
  'gnosis',
  'walletlink'
] as Wallet[];
export const WalletNameMap: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'WalletConnect',
  gnosis: 'Gnosis Safe',
  walletlink: 'Coinbase',
  tally: 'Tally'
};

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
  isSanctioned: Ref<boolean>;
};

type WalletState = 'connecting' | 'connected' | 'disconnected';
type PluginState = {
  connector: any;
  walletState: WalletState;
};

async function isSanctionedAddress(address: string): Promise<boolean | null> {
  try {
    const response = await axios.post(SANCTIONS_ENDPOINT, [
      {
        address: address.toLowerCase()
      }
    ]);
    const isSanctioned = response.data[0].isSanctioned;
    return isSanctioned;
  } catch {
    return null;
  }
}

export default {
  install: async app => {
    const { trackGoal, Goals } = useFathom();
    const alreadyConnectedAccount = ref(lsGet('connectedWallet', null));
    const alreadyConnectedProvider = ref(lsGet('connectedProvider', null));
    const isSanctioned = ref(false);
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
        rpcProviderService.getJsonProvider(chainId.value)
    );
    const signer = computed(() => pluginState.connector?.provider?.getSigner());
    const userProvider = computed(() => {
      return new Web3Provider(pluginState.connector.provider as any);
    });

    async function getWalletConnector(
      wallet: Wallet
    ): Promise<Connector | void> {
      if (wallet === 'metamask') {
        const { MetamaskConnector } = await import(
          /* webpackChunkName: "MetamaskConnector" */
          '@/services/web3/connectors/metamask/metamask.connector'
        );
        return new MetamaskConnector(alreadyConnectedAccount.value);
      }

      if (wallet === 'walletconnect') {
        const { WalletConnectConnector } = await import(
          /* webpackChunkName: "WalletConnectConnector" */
          '@/services/web3/connectors/trustwallet/walletconnect.connector'
        );
        return new WalletConnectConnector(alreadyConnectedAccount.value);
      }

      if (wallet === 'gnosis') {
        const { GnosisSafeConnector } = await import(
          /* webpackChunkName: "GnosisSafeConnector" */
          '@/services/web3/connectors/gnosis/gnosis.connector'
        );
        return new GnosisSafeConnector(alreadyConnectedAccount.value);
      }

      if (wallet === 'walletlink') {
        const { WalletLinkConnector } = await import(
          /* webpackChunkName: "WalletLinkConnector" */
          '@/services/web3/connectors/walletlink/walletlink.connector'
        );
        return new WalletLinkConnector(alreadyConnectedAccount.value);
      }

      if (wallet === 'tally') {
        const { TallyConnector } = await import(
          /* webpackChunkName: "TallyConnector" */
          '@/services/web3/connectors/tally/tally.connector'
        );
        return new TallyConnector(alreadyConnectedAccount.value);
      }
    }

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
        const connector = await getWalletConnector(wallet);

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

        // Add the new provider to the web3 service
        web3Service.setUserProvider(userProvider);

        // for when user reloads the app on an already connected wallet
        // need to store address to pre-load that connection
        if (account.value) {
          // fetch sanctioned status
          let _isSanctioned = await isSanctionedAddress(account.value);
          if (_isSanctioned === null) {
            // await disconnectWallet();
            // throw new Error(
            //   `Could not receive an appropriate response from the Sanctions API. Aborting.`
            // );
            _isSanctioned = false;
          }
          isSanctioned.value = _isSanctioned;
          if (_isSanctioned) {
            disconnectWallet();
          }
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
      signer,
      isSanctioned
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};

export function getConnectorName(connectorId: string): string {
  if (connectorId === 'injectedMetamask') {
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
  if (connectorId === 'injectedTally') {
    return 'Tally';
  }
  if (connectorId === 'fortmatic') {
    return 'Fortmatic';
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
    if (provider.isTally) {
      return tallyLogo;
    }
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
  if (connectorId === 'injectedMetamask') {
    return metamaskLogo;
  }
  if (connectorId === 'injectedTally') {
    return tallyLogo;
  }
  if (connectorId === 'fortmatic') {
    return fortmaticLogo;
  }
  if (connectorId === 'walletconnect') {
    return walletconnectLogo;
  }
  if (connectorId === 'walletlink') {
    return walletlinkLogo;
  }
  return defaultLogo;
}
