import Notify from 'bnc-notify';

export const blocknativeSymbol = Symbol();

export default {
  install: app => {
    const notifyInstance = Notify({
      dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
      networkId: Number(process.env.VUE_APP_DEFAULT_NETWORK) || 1
    });

    // Make plugin available in options API
    app.config.globalProperties.$bnNotify = notifyInstance || {};

    // Make plugin available in composition API
    app.provide(blocknativeSymbol, notifyInstance);
  }
};
