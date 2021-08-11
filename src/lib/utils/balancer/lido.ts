import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';

export function isStETHTrade(tokenInAddress: string, tokenOutAddress: string) {
  return [tokenInAddress, tokenOutAddress]
    .map(getAddress)
    .includes(getAddress(configService.network.addresses.stETH));
}
