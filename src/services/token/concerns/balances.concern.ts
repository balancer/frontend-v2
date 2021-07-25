import TokenService from '../token.service';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { multicall } from '@/lib/utils/balancer/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { TokenInfoMap } from '@/types/TokenList';
import { formatUnits } from '@ethersproject/units';
import { chunk } from 'lodash';

// TYPES
export type BalanceMap = { [address: string]: string };

export default class BalancesConcern {
  constructor(private readonly service: TokenService) {}

  async get(account: string, tokens: TokenInfoMap): Promise<BalanceMap> {
    try {
      const paginatedAddresses = chunk(Object.keys(tokens), 100);
      const multicalls: Promise<any>[] = [];

      paginatedAddresses.forEach(addresses => {
        const request = this.fetchBalances(account, addresses, tokens);
        multicalls.push(request);
      });

      const paginatedBalances = await Promise.all<BalanceMap>(multicalls);

      return paginatedBalances.reduce((result, current) =>
        Object.assign(result, current)
      );
    } catch (error) {
      console.error('Failed to fetch balances', account, error);
      return {};
    }
  }

  private async fetchBalances(
    account,
    addresses: string[],
    tokens: TokenInfoMap
  ): Promise<BalanceMap> {
    const network = this.service.configService.network.key;
    const provider = this.service.rpcProviderService.jsonProvider;

    const balances: [BigNumber][] = await multicall(
      network,
      provider,
      erc20Abi,
      addresses.map(address => [address, 'balanceOf', [account]])
    );

    return this.associateBalances(balances, addresses, tokens);
  }

  private associateBalances(
    balances: [BigNumber][],
    addresses: string[],
    tokens: TokenInfoMap
  ): BalanceMap {
    return Object.fromEntries(
      addresses.map((address, i) => [
        getAddress(address),
        formatUnits(balances[i][0].toString(), tokens[address].decimals)
      ])
    );
  }
}
