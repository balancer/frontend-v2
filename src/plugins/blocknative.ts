import BlocknativeSdk from 'bnc-sdk';
import { InitializationOptions } from 'bnc-sdk/dist/types/src/interfaces';

import { networkId } from '@/composables/useNetwork';

export const bnSdkSymbol = Symbol();

export const defaultOptions: InitializationOptions = {
  dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
  networkId: networkId.value,
  onerror: error => {
    console.log(`[Blocknative] encountered an error`, error);
  },
};

export default {
  install: app => {
    const blocknative = new BlocknativeSdk(defaultOptions);

    // filter out pending simulation events
    blocknative
      .configuration({
        scope: 'global',
        filters: [{ status: 'pending-simulation', _not: true }],
      })
      .catch(() => {
        // swallow server timeout response error as we are not waiting on it
      });

    // Make plugin available in options API
    app.config.globalProperties.$blocknative = blocknative || {};

    // Make plugin available in composition API
    app.provide(bnSdkSymbol, blocknative);
  },
};
