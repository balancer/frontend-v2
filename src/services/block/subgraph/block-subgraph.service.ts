import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { blockSubgraphClient } from './block-subgraph.client';
import BlockNumber from './entities/block-number';

export default class BlockSubgraphService {
  blockNumber: BlockNumber;

  constructor(
    readonly client = blockSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.blockNumber = new BlockNumber(this);
  }
}

export const blockSubgraphService = new BlockSubgraphService();
