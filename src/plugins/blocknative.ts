import Notify from 'bnc-notify';

export const bnNotifySymbol = Symbol();

interface Options {
  dappId: string;
  networkId: number;
  desktopPosition: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | undefined;
}

export const defaultOptions: Options = {
  dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
  networkId: Number(process.env.VUE_APP_NETWORK) || 1,
  desktopPosition: 'bottomLeft'
};

export default {
  install: app => {
    const notifyInstance = Notify(defaultOptions);

    // Make plugin available in options API
    app.config.globalProperties.$bnNotify = notifyInstance || {};

    // Make plugin available in composition API
    app.provide(bnNotifySymbol, notifyInstance);
  }
};
