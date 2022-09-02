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
        const startTimestamp = bnum(timestamp).minus(oneHourInSecs);
        query = {
          where: {
            timestamp_gt: startTimestamp.toString(),
            timestamp_lt: timestamp,
          },
        };
      } else {
        query = {
          where: {
            timestamp: timestamp,
          },
        };
      }

      const response: BlockNumberResponse =
        await this.subgraphService.blockNumber.get(query);

      console.log(response.blocks);
      return parseInt(response.blocks[0].number);
    } catch (error) {
      if (useRange) return this.fetchBlockByTime(timestamp, false);
      throw error;
    }
  }
}

export const blockService = new BlockService();
