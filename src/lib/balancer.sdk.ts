import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';

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
const {
  VUE_APP_TENDERLY_USER,
  VUE_APP_TENDERLY_PROJECT,
  VUE_APP_TENDERLY_ACCESS_KEY,
} = process.env;

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
  tenderly: {
    user: VUE_APP_TENDERLY_USER as string,
    project: VUE_APP_TENDERLY_PROJECT as string,
    accessKey: VUE_APP_TENDERLY_ACCESS_KEY as string,
  },
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  await balancer.swaps.fetchPools();
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (process.env.NODE_ENV !== 'test') fetchPoolsForSor();
