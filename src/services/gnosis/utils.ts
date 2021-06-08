import { APP_NETWORK_ID_STR } from '@/constants/network';
import { ETHER } from '@/constants/tokenlists';
import configs from '@/lib/config';

export function checkIfEther(tokenAddress: string) {
  let checkedAddress = tokenAddress;
  if (tokenAddress === ETHER.symbol) {
    checkedAddress = configs[APP_NETWORK_ID_STR].addresses.weth;
  }

  return checkedAddress;
}

export function toApiAddress(address: string) {
  if (address === ETHER.symbol) {
    return configs[APP_NETWORK_ID_STR].addresses.weth;
  }

  return address;
}
