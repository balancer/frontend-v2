import { BigNumberish } from 'ethers';

import { configService } from '@/services/config/config.service';

import { includesAddress } from '../..';

const { stETH: stEthAddress } = configService.network.addresses;

export function isStETH(tokenInAddress: string, tokenOutAddress: string) {
  if (!tokenInAddress || !tokenOutAddress || !stEthAddress) return false;

  return includesAddress([tokenInAddress, tokenOutAddress], stEthAddress);
}

export function getWstETHByStETH(stETHAmount: BigNumberish) {
  return stETHAmount;
}

export function getStETHByWstETH(wstETHAmount: BigNumberish) {
  return wstETHAmount;
}
