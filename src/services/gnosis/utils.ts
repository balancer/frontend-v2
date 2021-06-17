import { APP_NETWORK_ID } from '@/constants/network';
import { ETHER } from '@/constants/tokenlists';
import configs from '@/lib/config';
import { OrderMetaData } from './types';

export function normalizeTokenAddress(tokenAddress: string) {
  if (tokenAddress.toLowerCase() === ETHER.address.toLowerCase()) {
    return configs[APP_NETWORK_ID].addresses.weth;
  }

  return tokenAddress;
}

export function getMarket(sellToken: string, buyToken: string, kind: string) {
  let baseToken = buyToken;
  let quoteToken = sellToken;

  if (kind === 'sell') {
    baseToken = sellToken;
    quoteToken = buyToken;
  }

  return `${normalizeTokenAddress(baseToken)}-${normalizeTokenAddress(
    quoteToken
  )}`;
}

export function isOrderFinalized(orderFromApi: OrderMetaData | null): boolean {
  return (
    orderFromApi !== null &&
    Number(orderFromApi.executedBuyAmount) > 0 &&
    Number(orderFromApi.executedSellAmount) > 0
  );
}
