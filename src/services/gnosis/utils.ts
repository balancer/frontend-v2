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
