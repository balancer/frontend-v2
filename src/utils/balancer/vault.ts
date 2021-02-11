import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { call, sendTransaction } from '@/utils/balancer/web3';
import constants from './constants';
import { abi } from './abi/Vault.json';

export async function getNumberOfPools(
  provider: JsonRpcProvider
): Promise<number> {
  return await call(provider, abi, [constants.vault, 'getNumberOfPools']);
}

export async function getVault(
  network: string,
  provider: JsonRpcProvider
): Promise<any> {
  // @ts-ignore
  const multi = new Multicaller(network, provider, abi);
  multi.call('numberOfPools', constants.vault, 'getNumberOfPools', []);
  multi.call(
    'protocolFlashLoanFee',
    constants.vault,
    'getProtocolFlashLoanFee',
    []
  );
  multi.call('protocolSwapFee', constants.vault, 'getProtocolSwapFee', []);
  multi.call(
    'protocolWithdrawFee',
    constants.vault,
    'getProtocolWithdrawFee',
    []
  );
  return await multi.execute();
}

export async function joinPool(web3: Web3Provider, params: any[]) {
  return await sendTransaction(web3, constants.vault, abi, 'joinPool', params);
}

export async function exitPool(web3: Web3Provider, params: any[]) {
  return await sendTransaction(web3, constants.vault, abi, 'exitPool', params);
}
