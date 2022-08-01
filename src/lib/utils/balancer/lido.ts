import { BigNumberish, Contract } from 'ethers';

import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { includesAddress } from '..';

const { stETH: stEthAddress, wstETH: wstEthAddress } =
  configService.network.addresses;

export function isStETH(tokenInAddress: string, tokenOutAddress: string) {
  if (!tokenInAddress || !tokenOutAddress || !stEthAddress) return false;
  console.log('stETH: ', stEthAddress, ' is null: ', stEthAddress == null);

  return includesAddress([tokenInAddress, tokenOutAddress], stEthAddress);
}

export function isStEthAddress(address: string): boolean {
  return address.toLowerCase() === stEthAddress.toLowerCase();
}

export function isWstEthAddress(address: string): boolean {
  return address.toLowerCase() === wstEthAddress.toLowerCase();
}

export function includesWstEth(
  addresses: string[],
  wstEthAddress = configService.network.addresses.wstETH
): boolean {
  if (!wstEthAddress) return false;

  return includesAddress(addresses, wstEthAddress);
}

/**
 * @notice Get amount of wstETH for a given amount of stETH
 */
export function getWstETHByStETH(stETHAmount: BigNumberish) {
  const wstETH = new Contract(
    wstEthAddress,
    [
      'function getWstETHByStETH(uint256 stETHAmount) external view returns (uint256)',
    ],
    rpcProviderService.jsonProvider
  );
  return wstETH.getWstETHByStETH(stETHAmount);
}

/**
 * @notice Get amount of stETH for a given amount of wstETH
 */
export function getStETHByWstETH(wstETHAmount: BigNumberish) {
  const wstETH = new Contract(
    wstEthAddress,
    [
      'function getStETHByWstETH(uint256 wstETHAmount) external view returns (uint256)',
    ],
    rpcProviderService.jsonProvider
  );
  return wstETH.getStETHByWstETH(wstETHAmount);
}
