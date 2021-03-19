import Notify from 'bnc-notify';
import { useStore } from 'vuex';

export default function useBlocknative() {
  const store = useStore();

  return Notify({
    dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
    networkId: Number(store.state.web3.config.key) || 1
  });
}
