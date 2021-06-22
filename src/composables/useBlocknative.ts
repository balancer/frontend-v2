import Notify from 'bnc-notify';
import { inject } from 'vue';
import { bnNotifySymbol } from '@/plugins/blocknative';

export default function useBlocknative() {
  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  if (!notify) throw new Error('Blocknative Notify missing!');

  return {
    notify
  };
}
