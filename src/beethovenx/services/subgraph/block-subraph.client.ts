import axios from 'axios';
import { configService as _configService } from '@/services/config/config.service';
import { getUnixTime, startOfHour, subHours } from 'date-fns';

export default class BlockSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.blockSubgraph || '';
  }

  public async getAverageBlockTime(): Promise<number> {
    const data = await this.getBlocks();
    const blocks = data.blocks;

    if (blocks.length === 0) {
      console.error(
        'Unable to retrieve the blocks, returning a default value of 2 seconds per block'
      );
      return 2;
    }

    return blocks.reduce(
      (previousValue, currentValue, currentIndex) => {
        if (previousValue.timestamp) {
          const difference = previousValue.timestamp - currentValue.timestamp;

          previousValue.averageBlockTime =
            previousValue.averageBlockTime + difference;
        }

        previousValue.timestamp = currentValue.timestamp;

        if (currentIndex === blocks.length - 1) {
          return previousValue.averageBlockTime / blocks.length;
        }

        return previousValue;
      },
      { timestamp: null, averageBlockTime: 0 }
    );
  }

  private async getBlocks() {
    const now = startOfHour(Date.now());
    const start = getUnixTime(subHours(now, 6));
    const end = getUnixTime(now);

    const query = `
    query {
      blocks(
        first: 1000
        skip: 0
        orderBy: number
        orderDirection: desc
        where: { timestamp_gt: ${start}, timestamp_lt: ${end} }
      ) {
        id
        number
        timestamp
      }
    }
    `;

    return this.get(query);
  }

  private async get(query) {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export const blockSubgraphClient = new BlockSubgraphClient();
