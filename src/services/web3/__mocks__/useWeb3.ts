import { AddressZero } from '@ethersproject/constants';

import { configService } from '@/services/config/config.service';
import { computed } from 'vue';

export default function useWeb3Mock() {
  return {
    getProvider: vi.fn(),
    appNetworkConfig: {
      nativeAsset: {
        address: configService.network.nativeAsset.address,
      },
    },
    account: {
      value: AddressZero,
    },
    isWalletReady: computed(() => true),
    explorerLinks: {
      addressLink: (address: string) => `$test-explorer/address/${address}`,
    },
  };
}
