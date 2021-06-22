import TokenService from '../token.service';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { multicall } from '@/lib/utils/balancer/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';

// TYPES
export type BalanceDictionary = { [address: string]: BigNumber };

export default class BalanceConcern {
  constructor(private readonly service: TokenService) {}

  async getMany(
    account: string,
    userNetwork: string,
    addresses: string[]
  ): Promise<BalanceDictionary> {
    try {
      const provider = this.service.rpcProviderService.getJsonProvider(
        userNetwork
      );
      const balances: [BigNumber][] = await multicall(
        userNetwork,
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
  ): BalanceDictionary {
    return Object.fromEntries(
      addresses.map((address, i) => [getAddress(address), balances[i][0]])
    );
  }
}
