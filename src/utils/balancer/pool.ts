import { call, multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VAULT_ADDRESS } from './constants';
import { abi } from './abi/Vault.json';
import Strategy from './strategy';
import strategies from './strategies';

export default class Pool {
  public network: string;
  public provider: JsonRpcProvider;
  public id: string;

  public tokens?: string[];
  public controller?: string;
  public strategyType?: number;
  public strategyAddress?: string;
  public strategy?: Strategy;
  public tokenBalances?: any[];

  constructor(network: string, provider: JsonRpcProvider, id: string) {
    this.network = network;
    this.provider = provider;
    this.id = id;
  }

  async load() {
    [
      [this.tokens],
      [this.controller],
      [this.strategyAddress, this.strategyType]
    ] = await multicall(this.network, this.provider, abi, [
      [VAULT_ADDRESS, 'getPoolTokens', [this.id]],
      [VAULT_ADDRESS, 'getPoolController', [this.id]],
      [VAULT_ADDRESS, 'getPoolStrategy', [this.id]]
    ]);
    const strategy = new strategies[this.strategyType || 0].class(
      this.network,
      this.provider,
      this.strategyType,
      this.strategyAddress
    );
    [this.tokenBalances] = await Promise.all([
      await call(this.provider, abi, [
        VAULT_ADDRESS,
        'getPoolTokenBalances',
        [this.id, this.tokens]
      ]),
      await strategy.load(this.tokens)
    ]);
    this.strategy = strategy;
  }
}
