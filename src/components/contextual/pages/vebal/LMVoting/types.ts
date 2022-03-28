import { Network } from '@balancer-labs/sdk';

import { PoolType } from '@/services/balancer/subgraph/types';

export type Pool = {
  id: string;
  poolType: PoolType;
  tokens: Array<{
    address: string;
    symbol: string;
    weight: string;
  }>;
  chain: Network;
};
