import { configService } from '@/services/config/config.service';
import { twentyFourHoursInSecs } from './useTime';

export type TimeTravelPeriod = '24h';

export async function getTimeTravelBlock(
  currentBlock: number,
  period: TimeTravelPeriod = '24h'
): Promise<number> {
  const dayAgo = `${Math.floor(Date.now() / 1000) - twentyFourHoursInSecs}`;

  switch (period) {
    case '24h':
      return fetchBlockByTime(dayAgo);
    default:
      return fetchBlockByTime(dayAgo);
  }
}

const query = (timestamp: string) => `{
  blocks(first: 1, orderBy: number, orderDirection: asc, where: { timestamp_gt: ${timestamp} }) {
    number
  }
}`;

interface BlockNumberResponse {
  data: {
    blocks: [
      {
        number: string;
      }
    ];
  };
}

const fetchBlockByTime = async (timestamp: string): Promise<number> => {
  const endpoint = configService.network.subgraphs.blocks;
  const payload = {
    query: query(timestamp),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const {
    data: { blocks },
  } = (await response.json()) as BlockNumberResponse;

  return parseInt(blocks[0].number);
};
