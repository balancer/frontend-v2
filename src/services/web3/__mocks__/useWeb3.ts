import { AddressZero } from '@ethersproject/constants';

import { configService } from '@/services/config/config.service';

export default function useWeb3Mock() {
  return {
    getProvider: jest.fn().mockImplementation(),
    appNetworkConfig: {
      nativeAsset: {
        address: configService.network.nativeAsset.address,
      },
    },
    account: {
      value: AddressZero,
    },
  };
}
