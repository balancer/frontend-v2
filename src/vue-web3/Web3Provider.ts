import { MetamaskConnector } from './connectors/metamask/MetamaskConnector';
import { Connector } from './connectors/Connector';
import { reactive, Ref, toRefs } from 'vue';

type Wallet = 'metamask' | 'trustwallet';
type ConnectorImplementation = new (...args: any[]) => Connector;
export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');
export const Web3AccountSymbol = Symbol('WEB3_ACCOUNT');
export type Web3Provider = {
  connectWallet: (wallet: Wallet) => Promise<void>;
  provider: unknown;
  account: Ref<string[]>;
  chainId: Ref<number>;
};

const WalletConnectorDictionary: Record<Wallet, ConnectorImplementation> = {
  metamask: MetamaskConnector,
  trustwallet: MetamaskConnector
};

export default {
  install: (app, Web3Library) => {
    const providerData = reactive({
      provider: null,
      account: [''],
      chainId: 0
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
      const { provider, account, chainId } = await connector.connect();
      providerData.provider = new Web3Library(provider);
      providerData.account = account.value as string[];
      providerData.chainId = chainId.value as number;
    };

    const payload: Web3Provider = {
      connectWallet,
      ...toRefs(providerData)
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};
