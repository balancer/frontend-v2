import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { inject } from 'vue';
import { bnNotifySymbol, bnSDKSymbol } from '@/plugins/blocknative';

export default function useBlocknative() {
  const sdk = inject(bnSDKSymbol) as BlocknativeSdk;
  if (!sdk) throw new Error('Blocknative SDK missing!');

  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  if (!notify) throw new Error('Blocknative Notify missing!');

  return {
    sdk,
    notify
  };
}
