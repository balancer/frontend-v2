import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
import { isTestMode } from '@/plugins/modes';
import { FORKED_MAINNET_ID } from './config';

const network = ((): Network => {
  switch (configService.network.key) {
    case '1':
      return Network.MAINNET;
    case '5':
      return Network.GOERLI;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    default:
      return Network.MAINNET;
  }
})();

function sdkConfig(): BalancerSdkConfig {
  const { key } = configService.network;

  let config: BalancerSdkConfig = {
    network,
    rpcUrl: configService.rpc,
    customSubgraphUrl: configService.network.subgraph,
  };

  // Skip multicall balance fetching when running a local node.
  // Otherwise it gets really slow and will probably crash.
  if (key === FORKED_MAINNET_ID.toString()) {
    config = {
      ...config,
      sor: {
        fetchOnChainBalances: false,
      },
    };
  }

  return config;
}

export const balancer = new BalancerSDK(sdkConfig());

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  await balancer.swaps.fetchPools();
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (!isTestMode()) fetchPoolsForSor();
