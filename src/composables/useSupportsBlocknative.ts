import { Network } from '@/lib/config/types';
import { computed } from 'vue';

import useWeb3 from '@/services/web3/useWeb3';

const SUPPORTED_NETWORKS = [Network.MAINNET, Network.GOERLI, Network.POLYGON];

// Must be splitted from blocknative to reduce bundle size
export default function useSupportsBlocknative() {
  const { appNetworkConfig } = useWeb3();

  // TODO: blocknative is going to be deprecated for transaction tracking.
  const supportsBlocknative = computed(() =>
    SUPPORTED_NETWORKS.includes(appNetworkConfig.chainId)
  );

  return {
    supportsBlocknative,
  };
}
