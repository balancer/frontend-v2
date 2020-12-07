import { JsonRpcProvider } from '@ethersproject/providers';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { VAULT_ADDRESS } from './constants';
import { abi } from './abi/Vault.json';

export default class Vault {
  public network: string;
  public provider: JsonRpcProvider;
  public address: string = VAULT_ADDRESS;

  constructor(network: string, provider: JsonRpcProvider) {
    this.network = network;
    this.provider = provider;
  }

  async getTotalPools(): Promise<number> {
    return await call(this.provider, abi, [this.address, 'getTotalPools']);
  }

  async getPoolIds(start: number, end: number): Promise<string[]> {
    return await call(this.provider, abi, [
      this.address,
      'getPoolIds',
      [start, end]
    ]);
  }
}
