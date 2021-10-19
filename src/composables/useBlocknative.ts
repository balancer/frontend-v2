import { computed, inject } from 'vue';
import BlocknativeSdk from 'bnc-sdk';
import { bnSdkSymbol } from '@/plugins/blocknative';

import { Network } from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';

const SUPPORTED_NETWORKS = [
  Network.MAINNET,
  Network.KOVAN,
  Network.RINKEBY,
  Network.ROPSTEN,
  Network.GÖRLI,
  Network.POLYGON
];

export default function useBlocknative() {
  const { appNetworkConfig } = useWeb3();

  const blocknative = inject(bnSdkSymbol) as BlocknativeSdk;
  if (!blocknative) throw new Error('Blocknative SDK missing!');

  // TODO: blocknative is going to be deprecated for transaction tracking.
  const supportsBlocknative = computed(() =>
    SUPPORTED_NETWORKS.includes(appNetworkConfig.chainId)
  );

  return {
    blocknative,
    supportsBlocknative
  };
}
