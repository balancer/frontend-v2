import { Network, networkId } from '@/composables/useNetwork';

import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { aaveSubgraphClient } from './aave-subgraph.client';

import Reserves from './entities/reserves';

export default class AaveSubgraphService {
  reserves: Reserves;

  constructor(
    readonly client = aaveSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    // Init entities
    this.reserves = new Reserves(this);
  }

  public get blockTime(): number {
    switch (networkId.value) {
      case Network.MAINNET:
        return 13;
      case Network.POLYGON:
        return 2;
      case Network.ARBITRUM:
        return 3;
      case Network.KOVAN:
        // Should be ~4s but this causes subgraph to return with unindexed block error.
        return 1;
      default:
        return 13;
    }
  }
}

export const aaveSubgraphService = new AaveSubgraphService();
