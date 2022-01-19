import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network } from '@balancer-labs/sdk';

const network = ((): Network => {
  switch (configService.network.key) {
    case '1':
      return Network.MAINNET;
    case '42':
      return Network.KOVAN;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    default:
      return Network.MAINNET;
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc
});
