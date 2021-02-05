import { JsonRpcProvider } from '@ethersproject/providers';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import constants from './constants';
import { abi } from './abi/Vault.json';

export async function getNumberOfPools(
  provider: JsonRpcProvider
): Promise<number> {
  return await call(provider, abi, [constants.vault, 'getNumberOfPools']);
}

export async function getPoolIds(
  provider: JsonRpcProvider,
  start: number,
  end: number
): Promise<string[]> {
  return await call(provider, abi, [
    constants.vault,
    'getPoolIds',
    [start, end]
  ]);
}

export async function getVault(network: string, provider: JsonRpcProvider) {
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
