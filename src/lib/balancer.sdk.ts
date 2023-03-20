import {
  BalancerSDK,
  Network,
  BALANCER_NETWORK_CONFIG,
  BalancerNetworkConfig,
} from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
import { isTestMode } from '@/plugins/modes';

const network = ((): BalancerNetworkConfig => {
  switch (configService.network.key) {
    case '1':
      return BALANCER_NETWORK_CONFIG[Network.MAINNET];
    case '5':
      return BALANCER_NETWORK_CONFIG[Network.GOERLI];
    case '137': {
      let poolsToIgnore = [
        '0xc31a37105b94ab4efca1954a14f059af11fcd9bb', // StablePool with Convergence issues
      ];
      // Make sure to include `poolsToIgnore` already defined in SDK package
      if (BALANCER_NETWORK_CONFIG[Network.POLYGON].poolsToIgnore)
        poolsToIgnore = [
          ...poolsToIgnore,
          ...BALANCER_NETWORK_CONFIG[Network.POLYGON].poolsToIgnore,
        ];
      return {
        ...BALANCER_NETWORK_CONFIG[Network.POLYGON],
        poolsToIgnore,
      };
    }
    case '42161':
      return BALANCER_NETWORK_CONFIG[Network.ARBITRUM];
    case '100':
      return BALANCER_NETWORK_CONFIG[Network.GNOSIS];
    default:
      return BALANCER_NETWORK_CONFIG[Network.MAINNET];
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  await balancer.swaps.fetchPools();
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (!isTestMode()) fetchPoolsForSor();
