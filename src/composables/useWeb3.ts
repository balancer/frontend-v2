import { computed } from 'vue';
import { useStore } from 'vuex';

import configs from '@/config';

export default function useWeb3() {
  const store = useStore();
  const networkId = computed(() => store.state.web3.config.chainId);

  const explorerBaseURL = configs[networkId.value].explorer;

  // assumes etherscan.io
  const explorer = {
    txLink: (txHash: string) => `${explorerBaseURL}/tx/${txHash}`,
    addressLink: (address: string) => `${explorerBaseURL}/address/${address}`,
    tokenLink: (address: string) => `${explorerBaseURL}/token/${address}`
  };

  return { explorer };
}
