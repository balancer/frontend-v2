import Notify from 'bnc-notify';

export const blocknativeSymbol = Symbol();

export default {
  install: app => {
    const notifyInstance = Notify({
      dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
      networkId: 1
    });

    // Make plugin available in options API
    app.config.globalProperties.$notify = notifyInstance || {};

    // Make plugin available in composition API
    app.provide(blocknativeSymbol, notifyInstance);
  }
};
