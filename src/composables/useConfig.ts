import { Container } from 'typedi';
import { ConfigService } from '@/services/config/config.service';

export default function useConfig() {
  const configService = Container.get(ConfigService);

  return {
    env: configService.env,
    networkConfig: configService.network
  };
}
