import ConfigService, { configService } from '@/services/config/config.service';

describe('Config service', () => {
  describe('Get network config with key', () => {
    it('Fetches mainnet config with key of 1', () => {
      const networkConfig = configService.getNetworkConfig('1');
      expect(networkConfig.shortName).toBe('Mainnet');
    });

    it('Throws error if network not supported', () => {
      expect(() => {
        configService.getNetworkConfig('99');
      }).toThrow('No config for network key: 99');
    });
  });

  describe('Get app network config', () => {
    it('Returns the correct config for app network key', () => {
      process.env.VUE_APP_NETWORK = '137';
      const _configService = new ConfigService();
      expect(_configService.network.shortName).toBe('Polygon');
    });
  });
});
