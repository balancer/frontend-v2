import { configService } from '@/services/config/config.service';

export default function useConfig() {
  return {
    env: configService.env,
    networkConfig: configService.network,
  };
}
