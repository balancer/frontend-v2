import TokenService from '../token.service';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { multicall } from '@/lib/utils/balancer/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';

// TYPES
export type BalanceMap = { [address: string]: BigNumber };

export default class BalancesConcern {
  constructor(private readonly service: TokenService) {}

  async get(account: string, addresses: string[]): Promise<BalanceMap> {
    try {
      const network = this.service.configService.network.key;
      const provider = this.service.rpcProviderService.jsonProvider;
      const balances: [BigNumber][] = await multicall(
        network,
        provider,
        erc20Abi,
        addresses.map(token => [token, 'balanceOf', [account]])
      );
      return this.associateBalances(balances, addresses);
    } catch (error) {
      console.error('Failed to fetch balances', account, error);
      return {};
    }
  }

  private associateBalances(
    balances: [BigNumber][],
    addresses: string[]
  ): BalanceMap {
    return Object.fromEntries(
      addresses.map((address, i) => [getAddress(address), balances[i][0]])
    );
  }
}
