import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BigNumberish, Contract } from 'ethers';
import { getAddress } from 'ethers/lib/utils';

export function isStETH(tokenInAddress: string, tokenOutAddress: string) {
  return [tokenInAddress, tokenOutAddress]
    .map(getAddress)
    .includes(getAddress(configService.network.addresses.stETH));
}

/**
 * @notice Get amount of wstETH for a given amount of stETH
 */
export function getWstETHByStETH(stETHAmount: BigNumberish) {
  const wstETH = new Contract(
    configService.network.addresses.wstETH,
    [
      'function getWstETHByStETH(uint256 stETHAmount) external view returns (uint256)'
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
    configService.network.addresses.wstETH,
    [
      'function getStETHByWstETH(uint256 wstETHAmount) external view returns (uint256)'
    ],
    rpcProviderService.jsonProvider
  );
  return wstETH.getStETHByWstETH(wstETHAmount);
}
