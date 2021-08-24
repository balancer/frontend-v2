import { BigNumber } from '@ethersproject/bignumber';
import { configService } from '../config/config.service';

export function normalizeTokenAddress(tokenAddress: string) {
  const nativeAssetAddress = configService.network.nativeAsset.address;

  if (tokenAddress.toLowerCase() === nativeAssetAddress.toLowerCase()) {
    return configService.network.addresses.weth;
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

const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber(); // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)

export function calculateValidTo(deadlineInMinutes: number): number {
  const now = Date.now() / 1000;
  const validTo = Math.floor(deadlineInMinutes * 60 + now);

  return Math.min(validTo, MAX_VALID_TO_EPOCH);
}
