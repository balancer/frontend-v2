import Service from "../service";
import { default as vaultAbi } from '@/abi/Vault.json';
import { Multicaller } from '@/utils/balancer/contract';
import { getAddress } from '@ethersproject/address';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

interface PoolBalances {
  balances: Record<string, string>;
  totalSupply: string;
}

export default class Vault {
  service: Service;
  multiCaller: Multicaller;

  constructor(service) {
    this.service = service;
    this.multiCaller = new Multicaller(NETWORK, service.provider, vaultAbi);
  }

  public async getPoolBalances(id: string): Promise<PoolBalances> {
    const poolAddress = getAddress(id.slice(0, 42));
    let result = {} as Record<any, any>;
    this.multiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);
    result = await this.multiCaller.execute(result);
    this.service.multiCaller.call('totalSupply', poolAddress, 'totalSupply');
    result = await this.service.multiCaller.execute(result);

    const balances = {}
    result.poolTokens.tokens.map((token, i) => {
      balances[token] = result.poolTokens.balances[i].toString();
    })
    return {
      balances,
      totalSupply: result.totalSupply.toString()
    }
  }

  public get address(): string {
    return this.service.config.addresses.vault;
  }
}
