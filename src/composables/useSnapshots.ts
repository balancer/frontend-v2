import { twentyFourHoursInSecs } from './useTime';
import { blockService } from '@/services/block/block.service';

export type TimeTravelPeriod = '24h';

export async function getTimeTravelBlock(
  period: TimeTravelPeriod = '24h'
): Promise<number> {
  const dayAgo = `${Math.floor(Date.now() / 1000) - twentyFourHoursInSecs}`;

  switch (period) {
    case '24h':
      return blockService.fetchBlockByTime(dayAgo);
    default:
      return blockService.fetchBlockByTime(dayAgo);
  }
}
