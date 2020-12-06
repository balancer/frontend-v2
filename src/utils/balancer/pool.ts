import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VAULT_ADDRESS } from '@/utils/balancer/constants';
import { abi } from './abi/Vault.json';
import Strategy from './strategy';
import CwpStrategy from './strategies/cwp';
import FlattenedStrategy from './strategies/flattened';

export default class Pool {
  public network: string;
  public provider: JsonRpcProvider;
  public id: string;

  public tokens?: string[];
  public tokenBalances?: any[];
  public strategy?: Strategy;
  public controller?: string;

  constructor(network: string, provider: JsonRpcProvider, id: string) {
    this.network = network;
    this.provider = provider;
    this.id = id;
  }

  async load() {
    this.tokens = await call(this.provider, abi, [
      VAULT_ADDRESS,
      'getPoolTokens',
      [this.id]
    ]);

    this.tokenBalances = await call(this.provider, abi, [
      VAULT_ADDRESS,
      'getPoolTokenBalances',
      [this.id, this.tokens]
    ]);

    const [strategyAddress, strategyType] = await call(this.provider, abi, [
      VAULT_ADDRESS,
      'getPoolStrategy',
      [this.id]
    ]);

    const strategies = [CwpStrategy, FlattenedStrategy];
    const strategy = new strategies[strategyType](
      this.network,
      this.provider,
      strategyType,
      strategyAddress
    );
    await strategy.load();
    console.log('Swap fee', strategy.swapFee);
    this.strategy = strategy;

    this.controller = await call(this.provider, abi, [
      VAULT_ADDRESS,
      'getPoolController',
      [this.id]
    ]);
  }
}
