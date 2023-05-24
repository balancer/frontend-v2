import { configService } from '@/services/config/config.service';

/**
 * CONSTANTS
 */
export const NATIVE_ASSET_ADDRESS =
  configService.network.tokens.Addresses.nativeAsset;
export const WRAPPED_NATIVE_ASSET_ADDRESS =
  configService.network.tokens.Addresses.wNativeAsset;
export const DEFAULT_TOKEN_DECIMALS = 18;

export const TOKENS = configService.network.tokens;
