import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';

export const bnSDKSymbol = Symbol();
export const bnNotifySymbol = Symbol();

export default {
  install: app => {
    const options = {
      dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
      networkId: Number(process.env.VUE_APP_DEFAULT_NETWORK) || 1
    };

    const sdkInstance = new BlocknativeSdk(
      Object.assign({}, options, { name: 'bnSDK' })
    );

    const notifyInstance = Notify(
      Object.assign({}, options, { name: 'bnNotify' })
    );

    // Make plugin available in options API
    app.config.globalProperties.$bnSDK = sdkInstance || {};
    app.config.globalProperties.$bnNotify = notifyInstance || {};

    // Make plugin available in composition API
    app.provide(bnSDKSymbol, sdkInstance);
    app.provide(bnNotifySymbol, notifyInstance);
  }
};
