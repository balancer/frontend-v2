import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Multicaller } from '@/utils/balancer/contract';
import { call, sendTransaction } from '@/utils/balancer/web3';
import configs from '@/config';
import { default as abi } from '@/abi/Vault.json';

export async function getNumberOfPools(
  network: string,
  provider: JsonRpcProvider
): Promise<number> {
  const vaultAddress = configs[network].addresses.vault;
  return await call(provider, abi, [vaultAddress, 'getNumberOfPools']);
}

export async function getVault(
  network: string,
  provider: JsonRpcProvider
): Promise<any> {
  const vaultAddress = configs[network].addresses.vault;
  // @ts-ignore
  const multi = new Multicaller(network, provider, abi);
  multi.call('numberOfPools', vaultAddress, 'getNumberOfPools', []);
  multi.call(
    'protocolFlashLoanFee',
    vaultAddress,
    'getProtocolFlashLoanFee',
    []
  );
  multi.call('protocolSwapFee', vaultAddress, 'getProtocolSwapFee', []);
  multi.call('protocolWithdrawFee', vaultAddress, 'getProtocolWithdrawFee', []);
  return await multi.execute();
}

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
