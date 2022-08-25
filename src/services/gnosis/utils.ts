import { OrderKind } from '@cowprotocol/contracts';

import { configService } from '../config/config.service';
import { MAX_VALID_TO_EPOCH } from './constants';
import { CanonicalMarketParams, Market } from './types';

export function toErc20Address(tokenAddress: string) {
  const nativeAssetAddress = configService.network.nativeAsset.address;

  if (tokenAddress.toLowerCase() === nativeAssetAddress.toLowerCase()) {
    return configService.network.addresses.weth;
  }

  return tokenAddress;
}

export function getCanonicalMarket<T>({
  sellToken,
  buyToken,
  kind,
}: CanonicalMarketParams<T>): Market<T> {
  if (kind === OrderKind.SELL) {
    return {
      baseToken: sellToken,
      quoteToken: buyToken,
    };
  } else {
    return {
      baseToken: buyToken,
      quoteToken: sellToken,
    };
  }
}

export function calculateValidTo(deadlineInMinutes: number): number {
  const now = Date.now() / 1000;
  const validTo = Math.floor(deadlineInMinutes * 60 + now);

  return Math.min(validTo, MAX_VALID_TO_EPOCH);
}
