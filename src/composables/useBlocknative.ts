import Notify from 'bnc-notify';
// import { inject } from 'vue';
import { useStore } from 'vuex';
// import { blocknativeSymbol } from '@/plugins/blocknative';

export default function useBlocknative() {
  const store = useStore();

  // const notify = inject(blocknativeSymbol) as ReturnType<typeof Notify>;
  // if (!notify) throw new Error('No notify provided!');

  const notify = Notify({
    dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
    networkId: Number(store.state.web3.config.key) || 1
  });

  return notify;
}
