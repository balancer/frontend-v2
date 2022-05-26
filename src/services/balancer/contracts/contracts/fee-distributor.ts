import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units';
import { BigNumber, Contract } from 'ethers';
import { zipObject } from 'lodash';

import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import FeeDistributorStaticABI from '@/lib/abi/FeeDistributorStatic.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { web3Service } from '@/services/web3/web3.service';

export class FeeDistributor {
  public claimableTokens: string[] = [
    '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2', // bb-a-USD
    '0xba100000625a3754423978a60c9317c58a424e3D' // BAL
  ];

  constructor(
    private readonly abi = FeeDistributorABI,
    private readonly staticAbi = FeeDistributorStaticABI,
    private readonly config = configService,
    private readonly web3 = web3Service,
    public readonly address = config.network.addresses.feeDistributor,
    private readonly provider = rpcProviderService.jsonProvider
  ) {}

  /**
   * @summary Instantiates a contract instance for the FeeDistributor.
   * @returns Ethers Contract instance
   */
  public async getInstance(): Promise<Contract> {
    return new Contract(this.address, this.abi, this.provider);
  }

  /**
   * @summary Get claimable protocol fee reward balances
   * @descrition To get claimable balances we have to simulate a transaction to
   * the claimTokens method by modifing the ABI to make it a view function.
   */
  public async getClaimableBalances(userAddress: string): Promise<BalanceMap> {
    const balances = await this.web3.callStatic<BigNumber[]>(
      this.address,
      this.staticAbi,
      'claimTokens',
      [userAddress, this.claimableTokens]
    );
    const stringBalances = balances.map(balance => balance.toString());

    return zipObject(this.claimableTokens, stringBalances);
  }

  /**
   * @summary Claim all protocol reward token balances.
   */
  public async claimBalances(
    userAddress: string
  ): Promise<TransactionResponse> {
    return await this.web3.sendTransaction(
      this.address,
      this.abi,
      'claimTokens',
      [userAddress, this.claimableTokens]
    );
  }

  /**
   * @summary Claim specific protocol reward token balance.
   */
  public async claimBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<TransactionResponse> {
    return await this.web3.sendTransaction(
      this.address,
      this.abi,
      'claimToken',
      [userAddress, tokenAddress]
    );
  }

  /**
   * @summary
   */
  public async getTokensDistributedInWeek(
    token: string,
    timestamp: number
  ): Promise<string> {
    const instance = await this.getInstance();
    const amount = await instance.getTokensDistributedInWeek(token, timestamp);
    return formatUnits(amount, 18);
  }
}

export const feeDistributor = new FeeDistributor();
