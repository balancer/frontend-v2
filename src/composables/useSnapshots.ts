import { Network } from '@balancer-labs/sdk';

import { networkId } from './useNetwork';
import { twentyFourHoursInSecs } from './useTime';

export type TimeTravelPeriod = '24h';

export function blockTime(): number {
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
    case Network.GOERLI:
      return 1;
    default:
      return 13;
  }
}

export function getTimeTravelBlock(
  currentBlock: number,
  period: TimeTravelPeriod = '24h'
): number {
  const blocksInDay = Math.round(twentyFourHoursInSecs / blockTime());

  switch (period) {
    case '24h':
      return currentBlock - blocksInDay;
    default:
      return currentBlock - blocksInDay;
  }
}
