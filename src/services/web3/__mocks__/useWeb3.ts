import { configService } from '@/services/config/config.service';
export default function useWeb3Mock() {
  return {
    getProvider: jest.fn().mockImplementation(),
    isV1Supported: false,
    appNetworkConfig: {
      nativeAsset: {
        address: configService.network.nativeAsset.address
      }
    }
  };
}
