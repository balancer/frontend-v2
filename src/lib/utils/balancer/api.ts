import { configService } from '@/services/config/config.service';

export function isBalancerApiDefined() {
  const defined = configService.network.balancerApi;
  if (!defined)
    console.log(
      `Skipping balancer api provider in your current network (${configService.network.chainName})`
    );
  return defined;
}
