import ConfigService from '@/services/config/config.service';

export default function useConfig(
  configService: ConfigService = new ConfigService()
) {
  return {
    env: configService.env,
    networkConfig: configService.network
  };
}
