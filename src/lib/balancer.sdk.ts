import { BalancerSDK } from '@balancer-labs/sdk';
import { Network } from '@/lib/config/types';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
// import { isTestMode } from '@/plugins/modes';

export const balancer = new BalancerSDK({
  network: configService.network.chainId as Network,
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

// if (!isTestMode()) fetchPoolsForSor();
