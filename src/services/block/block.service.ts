import { BlockNumberResponse } from './types';
import BlockSubgraphService, {
  blockSubgraphService,
} from './subgraph/block-subgraph.service';
import { oneHourInSecs } from '@/composables/useTime';
import { bnum } from '@/lib/utils';

export default class BlockService {
  subgraphService: BlockSubgraphService;

  constructor(subgraphService = blockSubgraphService) {
    this.subgraphService = subgraphService;
  }

  public async fetchBlockByTime(
    timestamp: string,
    useRange = true
  ): Promise<number> {
    try {
      let query = {};
      if (useRange) {
        const oneHourLater = bnum(timestamp).plus(oneHourInSecs);
        query = {
          where: {
            timestamp_gt: timestamp,
            timestamp_lt: oneHourLater.toString(),
          },
        };
      } else {
        query = {
          where: {
            timestamp_gt: timestamp,
          },
        };
      }

      const response: BlockNumberResponse =
        await this.subgraphService.blockNumber.get(query);

      return parseInt(response.blocks[0].number);
    } catch (error) {
      if (useRange) return this.fetchBlockByTime(timestamp, false);
      throw error;
    }
  }
}

export const blockService = new BlockService();
