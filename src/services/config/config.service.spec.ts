import { networkSlug, networkId } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';

describe('Config service', () => {
  describe('Get network config with key', () => {
    it('Fetches mainnet config with key of 1', () => {
      const networkConfig = configService.getNetworkConfig(1);

      expect(networkConfig.shortName).toBe('Mainnet');
    });

    it('Throws error if network not supported', () => {
      expect(() => {
        configService.getNetworkConfig(99);
      }).toThrow('No config for network key: 99');
    });
  });

  describe('Get app network slug and id', () => {
    it('Returns the correct slug and id for app network key', () => {
      expect(networkSlug).toBe('goerli');
      expect(networkId.value).toBe(5);
    });
  });
});
