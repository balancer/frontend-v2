import { configService } from '@/services/config/config.service';
import { BigNumberish } from 'ethers';
import { getAddress } from 'ethers/lib/utils';

const { stETH: stEthAddress } = configService.network.addresses;

export function isStETH(tokenInAddress: string, tokenOutAddress: string) {
  if (!tokenInAddress || !tokenOutAddress || !stEthAddress) return false;

  return [tokenInAddress, tokenOutAddress]
    .map(getAddress)
    .includes(getAddress(stEthAddress));
}

export function getWstETHByStETH(stETHAmount: BigNumberish) {
  return stETHAmount;
}

export function getStETHByWstETH(wstETHAmount: BigNumberish) {
  return wstETHAmount;
}
