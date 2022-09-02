import { BlockNumberResponse } from './types';
import BlockSubgraphService, {
  blockSubgraphService,
} from './subgraph/block-subgraph.service';

export default class BlockService {
  subgraphService: BlockSubgraphService;

  constructor(subgraphService = blockSubgraphService) {
    this.subgraphService = subgraphService;
  }

  public async fetchBlockByTime(timestamp: string): Promise<number> {
    const response: BlockNumberResponse =
      await this.subgraphService.blockNumber.get({
        where: { timestamp_gt: timestamp },
      });

    return parseInt(response.blocks[0].number);
  }
}

export const blockService = new BlockService();
