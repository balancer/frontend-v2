import TokenService from '../token.service';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { multicall } from '@/lib/utils/balancer/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { TokenInfoMap } from '@/types/TokenList';
import { formatUnits } from '@ethersproject/units';
import { chunk } from 'lodash';
import { JsonRpcProvider } from '@ethersproject/providers';

// TYPES
export type BalanceMap = { [address: string]: string };

export default class BalancesConcern {
  network: string;
  provider: JsonRpcProvider;
  nativeAssetAddress: string;
  nativeAssetDecimals: number;

  constructor(private readonly service: TokenService) {
    this.network = this.service.configService.network.key;
    this.provider = this.service.rpcProviderService.jsonProvider;
    this.nativeAssetAddress = this.service.configService.network.nativeAsset.address;
    this.nativeAssetDecimals = this.service.configService.network.nativeAsset.decimals;
  }

  async get(account: string, tokens: TokenInfoMap): Promise<BalanceMap> {
    const paginatedAddresses = chunk(Object.keys(tokens), 1000);
    const multicalls: Promise<any>[] = [];

    paginatedAddresses.forEach(addresses => {
      const request = this.fetchBalances(account, addresses, tokens);
      multicalls.push(request);
    });

    const paginatedBalances = await Promise.all<BalanceMap>(multicalls);
    const validPages = paginatedBalances.filter(
      page => !(page instanceof Error)
    );

    return validPages.reduce((result, current) =>
      Object.assign(result, current)
    );
  }

  private async fetchBalances(
    account: string,
    addresses: string[],
    tokens: TokenInfoMap
  ): Promise<BalanceMap> {
    try {
      const balanceMap = {};

      // If native asset included in addresses, filter out for
      // multicall, but fetch indpendently and inject.
      if (addresses.includes(this.nativeAssetAddress)) {
        addresses = addresses.filter(
          address => address !== this.nativeAssetAddress
        );
        balanceMap[this.nativeAssetAddress] = await this.fetchNativeBalance(
          account
        );
      }

      const balances: [BigNumber][] = await multicall(
        this.network,
        this.provider,
        erc20Abi,
        addresses.map(address => [address, 'balanceOf', [account]])
      );

      return {
        ...this.associateBalances(balances, addresses, tokens),
        ...balanceMap
      };
    } catch (error) {
      console.error('Failed to fetch balances for:', addresses);
      throw error;
    }
  }

  private async fetchNativeBalance(account: string): Promise<string> {
    const balance = await this.provider.getBalance(account);
    return formatUnits(balance.toString(), this.nativeAssetDecimals);
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
