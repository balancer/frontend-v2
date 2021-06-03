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
      web3Instance: ref(null)
    };

    const notifyInstance = Notify(defaultNotifyOptions);
    web3State.onboardInstance.value = Onboard({
      ...defaultOnboardOptions,
      subscriptions: {
        wallet: wallet => {
          web3State.web3Instance.value = new Web3(wallet.provider);
          console.log('boom boom', web3State.web3Instance.value);
        }
      }
    });

    // Make plugin available in options API
    app.config.globalProperties.$bnNotify = notifyInstance || {};

    // Make plugin available in composition API
    app.provide(bnNotifySymbol, notifyInstance);
    app.provide(web3Symbol, web3State);
  }
};
