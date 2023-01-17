import { AddressZero } from '@ethersproject/constants';

import { configService } from '@/services/config/config.service';
import { ref } from 'vue';

export default function useWeb3Mock() {
  return {
    isWalletReady: ref(true),
    getProvider: vi.fn(),
    appNetworkConfig: {
      nativeAsset: {
        address: configService.network.nativeAsset.address,
      },
    },
    account: {
      value: AddressZero,
    },
    explorerLinks: {
      addressLink: (address: string) => `$test-explorer/address/${address}`,
    },
  };
}
