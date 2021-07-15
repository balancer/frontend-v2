import { computed, inject } from 'vue';
import BlocknativeSdk from 'bnc-sdk';
import { bnSdkSymbol } from '@/plugins/blocknative';
import useWeb3 from './useWeb3';

import { APP } from '@/constants/app';
import { Network } from '@/constants/network';

const SUPPORTED_NETWORKS = [Network.MAINNET, Network.KOVAN];

export default function useBlocknative() {
  const { appNetwork } = useWeb3();

  const blocknative = inject(bnSdkSymbol) as BlocknativeSdk;
  if (!blocknative) throw new Error('Blocknative SDK missing!');

  // TODO: blocknative is going to be deprecated for transaction tracking.
  const supportsBlocknative = computed(() =>
    APP.IsGnosisIntegration ? false : SUPPORTED_NETWORKS.includes(appNetwork.id)
  );

  return {
    blocknative,
    supportsBlocknative
  };
}
