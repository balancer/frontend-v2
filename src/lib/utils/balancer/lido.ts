import { BigNumberish, Contract } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { WeiPerEther as ONE } from '@ethersproject/constants';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { includesAddress } from '..';
import { Network } from '@balancer-labs/sdk';

const { stETH: stEthAddress, wstETH: wstEthAddress } =
  configService.network.addresses;

const wstEthRateProvidersMap = {
  [Network.MAINNET]: '0x72d07d7dca67b8a406ad1ec34ce969c90bfee768',
  [Network.ARBITRUM]: '0xf7c5c26b574063e7b098ed74fad6779e65e3f836',
  [Network.GOERLI]: '0x80a94f458491ca88f09767e58a92fd23cbf1196f',
};

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
export async function getStETHByWstETH(
  wstETHAmount: BigNumber,
  network: Network
) {
  const wstEthRateProvider = new Contract(
    wstEthRateProvidersMap[network],
    ['function getRate() external view returns (uint256)'],
    rpcProviderService.jsonProvider
  );
  const rate = await wstEthRateProvider.getRate();
  return wstETHAmount.mul(rate).div(ONE);
}
