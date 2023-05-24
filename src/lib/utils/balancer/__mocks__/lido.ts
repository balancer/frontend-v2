import { BigNumberish } from 'ethers';

import { configService } from '@/services/config/config.service';

import { includesAddress } from '../..';

const { stETH: stEthAddress } = configService.network.tokens.Addresses;

export function isStETH(tokenInAddress: string, tokenOutAddress: string) {
  if (!tokenInAddress || !tokenOutAddress || !stEthAddress) return false;

  return includesAddress([tokenInAddress, tokenOutAddress], stEthAddress);
}

export function isStEthAddress(address: string): boolean {
  if (!stEthAddress) return false;
  return address.toLowerCase() === stEthAddress.toLowerCase();
}

export function getWstETHByStETH(stETHAmount: BigNumberish) {
  return stETHAmount;
}

export function getStETHByWstETH(wstETHAmount: BigNumberish) {
  return wstETHAmount;
}
