import TokenService from '../token.service';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { multicall } from '@/lib/utils/balancer/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';

// TYPES
export type AllowanceMap = { [address: string]: BigNumber };
export type ContractAllowancesMap = { [address: string]: AllowanceMap };

export default class AllowancesConcern {
  nativeAssetAddress: string;

  constructor(private readonly service: TokenService) {
    this.nativeAssetAddress = this.service.configService.network.nativeAsset.address;
  }

  async get(
    account: string,
    contractAddresses: string[],
    tokenAddresses: string[]
  ): Promise<ContractAllowancesMap> {
    try {
      // Filter out eth (or native asset) since it's not relevant for allowances.
      tokenAddresses = tokenAddresses.filter(
        address => address !== this.nativeAssetAddress
      );

      const allContractAllowances = await Promise.all(
        contractAddresses.map(contractAddress =>
          this.getForContract(account, contractAddress, tokenAddresses)
        )
      );

      return Object.fromEntries(
        contractAddresses.map((contract, i) => [
          getAddress(contract),
          allContractAllowances[i]
        ])
      );
    } catch (error) {
      console.error('Failed to fetch allowances', account, error);
      return {};
    }
  }

  async getForContract(
    account: string,
    contractAddress: string,
    tokenAddresses: string[]
  ): Promise<AllowanceMap> {
    const network = this.service.configService.network.key;
    const provider = this.service.rpcProviderService.jsonProvider;

    const allowances: [BigNumber][] = await multicall(
      network,
      provider,
      erc20Abi,
      tokenAddresses.map(token => [
        token,
        'allowance',
        [account, contractAddress]
      ])
    );

    return Object.fromEntries(
      tokenAddresses.map((token, i) => [getAddress(token), allowances[i][0]])
    );
  }
}
