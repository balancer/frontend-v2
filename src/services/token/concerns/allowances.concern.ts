import { getAddress } from '@ethersproject/address';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { isSameAddress } from '@/lib/utils';
import { multicall } from '@/lib/utils/balancer/contract';
import { TokenInfoMap } from '@/types/TokenList';

import TokenService from '../token.service';

// TYPES
export type AllowanceMap = { [address: string]: string };
export type ContractAllowancesMap = { [address: string]: AllowanceMap };

export default class AllowancesConcern {
  nativeAssetAddress: string;

  constructor(private readonly service: TokenService) {
    this.nativeAssetAddress =
      this.service.configService.network.nativeAsset.address;
  }

  async get(
    account: string,
    contractAddresses: string[],
    tokens: TokenInfoMap
  ): Promise<ContractAllowancesMap> {
    try {
      // Filter out eth (or native asset) since it's not relevant for allowances.
      const tokenAddresses = Object.keys(tokens).filter(
        address => !isSameAddress(address, this.nativeAssetAddress)
      );

      const allContractAllowances = await Promise.all(
        contractAddresses.map(contractAddress =>
          this.getForContract(account, contractAddress, tokenAddresses, tokens)
        )
      );

      const result = Object.fromEntries(
        contractAddresses.map((contract, i) => [
          getAddress(contract),
          allContractAllowances[i],
        ])
      );
      return result;
    } catch (error) {
      console.error('Failed to fetch allowances for:', account, error);
      return {};
    }
  }

  async getForContract(
    account: string,
    contractAddress: string,
    tokenAddresses: string[],
    tokens: TokenInfoMap
  ): Promise<AllowanceMap> {
    const network = this.service.configService.network.key;
    const provider = this.service.rpcProviderService.jsonProvider;
    const allowances: BigNumber[] = (
      await multicall<BigNumberish>(
        network,
        provider,
        erc20Abi,
        tokenAddresses.map(token => [
          token,
          'allowance',
          [account, contractAddress],
        ])
      )
    ).map(balance => BigNumber.from(balance ?? '0')); // If we fail to read a token's allowance, treat it as zero;

    return Object.fromEntries(
      tokenAddresses.map((token, i) => [
        getAddress(token),
        formatUnits(allowances[i], tokens[token].decimals),
      ])
    );
  }
}
