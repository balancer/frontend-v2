import { AddressZero } from '@ethersproject/constants';

import { configService } from '@/services/config/config.service';

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
    isWalletReady: () => true,
  };
}
