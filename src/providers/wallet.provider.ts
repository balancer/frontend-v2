import {
  getMetamaskConnector,
  initMetamaskConnector,
} from '@/dependencies/wallets/metamask';
import { safeInject } from '@/providers/inject';

import symbolKeys from '@/constants/symbol.keys';
import { getAddress } from '@ethersproject/address';
import { JsonRpcSigner } from '@ethersproject/providers';
import { setTag } from '@sentry/browser';
import axios from 'axios';

import useFathom, { Goals, trackGoal } from '@/composables/useFathom';
import { WALLET_SCREEN_ENDPOINT } from '@/constants/exploits';
import { lsGet, lsSet } from '@/lib/utils';

import { networkId } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { Connector } from '@/services/web3/connectors/connector';
import { walletService } from '@/services/web3/wallet.service';
import { getWeb3Provider } from '@/dependencies/wallets/Web3Provider';
import config from '@/lib/config';
import {
  getSafeConnector,
  initSafeConnector,
} from '@/dependencies/wallets/safe';
import {
  getTallyConnector,
  initTallyConnector,
} from '@/dependencies/wallets/tally';
import {
  getWalletLinkConnector,
  initWalletLinkConnector,
} from '@/dependencies/wallets/walletlink';
import {
  getWalletconnectConnector,
  initWalletconnectConnector,
} from '@/dependencies/wallets/walletconnect';

export type Wallet =
  | 'metamask'
  | 'walletconnect'
  | 'safe'
  | 'walletlink'
  | 'tally';

export const SupportedWallets = [
  'metamask',
  'walletconnect',
  'safe',
  'walletlink',
] as Wallet[];

export const WalletNameMap: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'WalletConnect',
  safe: 'Safe',
  walletlink: 'Coinbase Wallet',
  tally: 'Tally',
};

type WalletState = 'connecting' | 'connected' | 'disconnected';
type PluginState = {
  connector: any;
  walletState: WalletState;
};
type WalletScreenResponse = { is_blocked: boolean };

export async function isBlockedAddress(
  address: string
): Promise<boolean | null> {
  try {
    if (!configService.env.WALLET_SCREENING) return false;
    trackGoal(Goals.WalletScreenRequest);

    const response = await axios.get<WalletScreenResponse>(
      `${WALLET_SCREEN_ENDPOINT}?address=${address.toLowerCase()}`
    );

    trackGoal(Goals.WalletScreened);
    return response.data.is_blocked;
  } catch {
    return false;
  }
}

export async function verifyTransactionSender(signer: JsonRpcSigner) {
  const signerAddress = await signer.getAddress();
  const _isBlockedAddress = await isBlockedAddress(signerAddress);
  if (_isBlockedAddress) {
    isBlocked.value = true;
    throw new Error(
      `Rejecting transaction. [${signerAddress}] is a sanctioned wallet.`
    );
  }
}

export async function verifyNetwork(signer: JsonRpcSigner) {
  const userNetwork = await signer.getChainId();
  if (userNetwork.toString() !== networkId.value.toString()) {
    throw new Error('Wallet network does not match app network.');
  }
}

export const isBlocked = ref(false);

export const wallets = () => {
  const { trackGoal, Goals } = useFathom();
  const alreadyConnectedAccount = ref(lsGet('connectedWallet', null));
  const alreadyConnectedProvider = ref(lsGet('connectedProvider', null));
  // this data provided is properly typed to all consumers
  // via the 'Web3Provider' type
  const pluginState = reactive<PluginState>({
    connector: null as any,
    walletState: 'disconnected',
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
    const Web3Provider = getWeb3Provider();
    return new Web3Provider(pluginState.connector.provider as any, 'any'); // https://github.com/ethers-io/ethers.js/issues/866
  });

  async function getWalletConnector(wallet: Wallet): Promise<Connector | void> {
    let Connector: Connector;
    if (wallet === 'metamask') {
      await initMetamaskConnector();
      Connector = getMetamaskConnector();
    }

    if (wallet === 'walletconnect') {
      await initWalletconnectConnector();
      Connector = getWalletconnectConnector();
    }

    if (wallet === 'safe') {
      await initSafeConnector();
      Connector = getSafeConnector();
    }

    if (wallet === 'walletlink') {
      await initWalletLinkConnector();
      Connector = getWalletLinkConnector();
    }

    if (wallet === 'tally') {
      await initTallyConnector();
      Connector = getTallyConnector();
    }
    //@ts-ignore
    return new Connector(alreadyConnectedAccount.value);
  }

  /**

  @param wallet User supplied web3 provider. i.e. (web3, ethers)

  It can be null because in wallet-provider we use:
  const alreadyConnectedProvider = ref(lsGet('connectedProvider', null));
  which is typed as any and it could return null

  **/
  const connectWallet = async (wallet: Wallet | null) => {
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

      setTag('wallet', wallet);
      if (connector?.chainId.value) {
        const network = config[connector.chainId.value]
          ? config[connector.chainId.value].slug
          : connector.chainId.value;
        setTag('walletNetwork', network);
      }

      // listens to wallet/chain changed and disconnect events
      connector.registerListeners();

      // it is handy to provide the connector instance
      pluginState.connector = connector;

      // Add the new provider to the web3 service
      walletService.setUserProvider(userProvider);

      // for when user reloads the app on an already connected wallet
      // need to store address to pre-load that connection
      if (account.value) {
        lsSet('connectedWallet', account.value);
        lsSet('connectedProvider', wallet);
        pluginState.walletState = 'connected';

        trackGoal(Goals.ConnectedWallet);
      } else {
        // Account not set and wallet is not connected
        pluginState.walletState = 'disconnected';
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

  watch(chainId, () => {
    const network = config[chainId.value]
      ? config[chainId.value].slug
      : chainId.value;
    setTag('walletNetwork', network);
  });

  return {
    connectWallet,
    disconnectWallet,
    ...toRefs(pluginState),
    account,
    chainId,
    provider,
    signer,
    isBlocked,
  };
};

export type WalletsResponse = ReturnType<typeof wallets>;
export const WalletsProviderSymbol: InjectionKey<WalletsResponse> = Symbol(
  symbolKeys.Providers.Wallets
);

export function provideWallets(): WalletsResponse {
  const providedWallets = wallets();
  provide(WalletsProviderSymbol, providedWallets);
  return providedWallets;
}

export const useWallets = (): WalletsResponse => {
  return safeInject(WalletsProviderSymbol);
};
