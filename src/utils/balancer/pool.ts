import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VAULT_ADDRESS } from '@/utils/balancer/constants';
import abi from '@/helpers/abi';

export default class Pool {
  public network: string;
  public provider: JsonRpcProvider;
  public id: string;

  public tokens?: string[];
  public tokenBalances?: any[];
  public strategy?: any[];
  public controller?: string;

  constructor(network: string, provider: JsonRpcProvider, id: string) {
    this.network = network;
    this.provider = provider;
    this.id = id;
  }

  async load() {
    this.tokens = await call(this.provider, abi['Vault'], [
      VAULT_ADDRESS,
      'getPoolTokens',
      [this.id]
    ]);

    this.tokenBalances = await call(this.provider, abi['Vault'], [
      VAULT_ADDRESS,
      'getPoolTokenBalances',
      [this.id, this.tokens]
    ]);

    this.strategy = await call(this.provider, abi['Vault'], [
      VAULT_ADDRESS,
      'getPoolStrategy',
      [this.id]
    ]);

    this.controller = await call(this.provider, abi['Vault'], [
      VAULT_ADDRESS,
      'getPoolController',
      [this.id]
    ]);
  }
}
