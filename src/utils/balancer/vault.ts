import { Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/utils/balancer/web3';
import configs from '@/config';
import { default as abi } from '@/abi/Vault.json';

export async function joinPool(
  network: string,
  web3: Web3Provider,
  params: any[]
) {
  const vaultAddress = configs[network].addresses.vault;
  return await sendTransaction(web3, vaultAddress, abi, 'joinPool', params);
}

export async function exitPool(
  network: string,
  web3: Web3Provider,
  params: any[]
) {
  const vaultAddress = configs[network].addresses.vault;
  return await sendTransaction(web3, vaultAddress, abi, 'exitPool', params);
}
