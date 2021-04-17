import Notify from 'bnc-notify';

export const bnNotifySymbol = Symbol();

export const defaultOptions = {
  dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
  networkId: Number(process.env.VUE_APP_NETWORK) || 1
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
