import { configService } from '@/services/config/config.service';

export const isBalancerApiDefined = !!configService.network.balancerApi;
