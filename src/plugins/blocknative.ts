import { lsGet, lsSet } from '@/lib/utils';
import Notify from 'bnc-notify';
import Onboard from 'bnc-onboard';
import { API } from 'bnc-onboard/dist/src/interfaces';
import { Ref, ref } from 'vue';
import Web3 from 'web3';

export const bnNotifySymbol = Symbol();
export const web3Symbol = Symbol('WEB3_STATE');

interface NotifyOptions {
  dappId: string;
  networkId: number;
  desktopPosition:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topRight'
    | undefined;
}

export type Web3State = {
  onboardInstance: Ref<null | API>;
  web3Instance: Ref<null | Web3>;
  network: Ref<null | number>;
  address: Ref<null | string>;
  balance: Ref<null | string>;
  walletProvider: Ref<null | string>;
};

export const defaultNotifyOptions: NotifyOptions = {
  dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
  networkId: Number(process.env.VUE_APP_NETWORK) || 1,
  desktopPosition: 'bottomLeft'
};

export const defaultOnboardOptions = {
  dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID,
  networkId: Number(process.env.VUE_APP_NETWORK)
};

export default {
  install: app => {
    const web3State: Web3State = {
      onboardInstance: ref(null),
      web3Instance: ref(null),
      network: ref(null),
      address: ref(null),
      balance: ref(null),
      walletProvider: ref(null)
    };

    const notifyInstance = Notify(defaultNotifyOptions);
    web3State.onboardInstance.value = Onboard({
      ...defaultOnboardOptions,
      subscriptions: {
        wallet: wallet => {
          web3State.walletProvider.value = wallet.name;
          web3State.web3Instance.value = new Web3(wallet.provider);
          lsSet('selectedWallet', wallet.name);
        },
        network: network => {
          web3State.network.value = network;
        },
        address: address => {
          web3State.address.value = address;
        },
        balance: balance => {
          web3State.balance.value = balance;
        }
      }
    });

    // Make plugin available in options API
    app.config.globalProperties.$bnNotify = notifyInstance || {};

    const prevWallet = lsGet('selectedWallet', null);
    if (web3State.onboardInstance.value) {
      web3State.onboardInstance.value.walletSelect(prevWallet);
    }

    // Make plugin available in composition API
    app.provide(bnNotifySymbol, notifyInstance);
    app.provide(web3Symbol, web3State);
  }
};
