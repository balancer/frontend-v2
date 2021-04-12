import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { inject } from 'vue';
import { bnNotifySymbol, defaultOptions } from '@/plugins/blocknative';

export default function useBlocknative() {
  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  if (!notify) throw new Error('Blocknative Notify missing!');

  function blocknative(networkId: number): BlocknativeSdk {
    return new BlocknativeSdk(Object.assign({}, defaultOptions, { networkId }));
  }

  return {
    blocknative,
    notify
  };
}
