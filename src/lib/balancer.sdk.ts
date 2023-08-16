import { BalancerSDK } from '@balancer-labs/sdk';
import { Network } from '@/lib/config';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
import { isTestMode } from '@/plugins/modes';
import { captureBalancerException } from './utils/errors';

export const balancer = new BalancerSDK({
  network: configService.network.chainId as Network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  try {
    console.time('fetchPoolsForSor');
    await balancer.swaps.fetchPools();
    hasFetchedPoolsForSor.value = true;
    console.timeEnd('fetchPoolsForSor');
  } catch (error) {
    captureBalancerException({
      error,
      context: {
        tags: {
          dependency: 'Balancer SDK',
        },
      },
    });
  }
}

if (!isTestMode()) fetchPoolsForSor();
