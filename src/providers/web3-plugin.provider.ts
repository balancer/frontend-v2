import { safeInject } from '@/providers/inject';

import symbolKeys from '@/constants/symbol.keys';
import { getAddress } from '@ethersproject/address';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { setTag } from '@sentry/browser';
import axios from 'axios';

import useFathom, { Goals, trackGoal } from '@/composables/useFathom';
import { WALLET_SCREEN_ENDPOINT } from '@/constants/exploits';
import { lsGet, lsSet } from '@/lib/utils';

import { networkId } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { Connector } from '@/services/web3/connectors/connector';
import { networkMap, Wallet } from '@/services/web3/web3.plugin';
import { web3Service } from '@/services/web3/web3.service';
import { InjectionKey } from 'vue';

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
      `Rejecting transaction. [${_isBlockedAddress}] is a sanctioned wallet.`
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

export const web3Provider = () => {
  onBeforeMount(async () => {
    console.log('Before mounting we3 provider');
  });

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
    return new Web3Provider(pluginState.connector.provider as any, 'any'); // https://github.com/ethers-io/ethers.js/issues/866
  });

  async function getWalletConnector(wallet: Wallet): Promise<Connector | void> {
    if (wallet === 'metamask') {
      const { MetamaskConnector } = await import(
        '@/services/web3/connectors/metamask/metamask.connector'
      );
      return new MetamaskConnector(alreadyConnectedAccount.value);
    }

    if (wallet === 'walletconnect') {
      const { WalletConnectConnector } = await import(
        '@/services/web3/connectors/trustwallet/walletconnect.connector'
      );
      return new WalletConnectConnector(alreadyConnectedAccount.value);
    }

    if (wallet === 'gnosis') {
      const { GnosisSafeConnector } = await import(
        '@/services/web3/connectors/gnosis/gnosis.connector'
      );
      return new GnosisSafeConnector(alreadyConnectedAccount.value);
    }

    if (wallet === 'walletlink') {
      const { WalletLinkConnector } = await import(
        '@/services/web3/connectors/walletlink/walletlink.connector'
      );
      return new WalletLinkConnector(alreadyConnectedAccount.value);
    }

    if (wallet === 'tally') {
      const { TallyConnector } = await import(
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

      setTag('wallet', wallet);
      setTag('network', networkMap[chainId.value]);

      // listens to wallet/chain changed and disconnect events
      connector.registerListeners();

      // it is handy to provide the connector instance
      pluginState.connector = connector;

      // Add the new provider to the web3 service
      web3Service.setUserProvider(userProvider);

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

  //This computed was moved from useWeb3
  const isWalletReady = computed(() => pluginState.walletState === 'connected');

  return {
    connectWallet,
    disconnectWallet,
    ...toRefs(pluginState),
    account,
    isWalletReady,
    chainId,
    provider,
    signer,
    isBlocked,
  };
};

export type Web3PluginResponse = ReturnType<typeof web3Provider>;
export const Web3ProviderSymbol: InjectionKey<Web3PluginResponse> = Symbol(
  symbolKeys.Providers.Web3Plugin
);

export function provideWeb3Plugin(): Web3PluginResponse {
  const web3 = web3Provider();
  provide(Web3ProviderSymbol, web3);
  return web3;
}

export const isWeb3PluginLoaded = ref(false);


export const useWeb3Plugin = (): Web3PluginResponse => {
  return safeInject(Web3ProviderSymbol);
};
