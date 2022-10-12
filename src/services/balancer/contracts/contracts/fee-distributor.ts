import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units';
import { BigNumber, Contract } from 'ethers';
import { zipObject } from 'lodash';

import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import FeeDistributorStaticABI from '@/lib/abi/FeeDistributorStatic.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { web3Service } from '@/services/web3/web3.service';

export class FeeDistributor {
  public claimableTokens: string[] = [
    '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2', // bb-a-USD v1
    '0xA13a9247ea42D743238089903570127DdA72fE44', // bb-a-USD v2
    '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
  ];

  constructor(
    public readonly address: string,
    private readonly abi = FeeDistributorABI,
    private readonly staticAbi = FeeDistributorStaticABI,
    private readonly config = configService,
    private readonly web3 = web3Service,
    private readonly provider = rpcProviderService.jsonProvider
  ) {}

  /**
   * @summary Instantiates a contract instance for the FeeDistributor.
   * @returns Ethers Contract instance
   */
  public getInstance(): Contract {
    return new Contract(this.address, this.abi, this.provider);
  }

  /**
   * @summary Instantiates a multicaller instance of the FeeDistributor
   */
  public getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }

  /**
   * @summary Get claimable protocol fee reward balances
   * @descrition To get claimable balances we have to simulate a transaction to
   * the claimTokens method by modifing the ABI to make it a view function.
   */
  public async getClaimableBalances(userAddress: string): Promise<BalanceMap> {
    const balances = await this.web3.txBuilder.contract.callStatic<BigNumber[]>(
      {
        contractAddress: this.address,
        abi: this.staticAbi,
        action: 'claimTokens',
        params: [userAddress, this.claimableTokens],
      }
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
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claimTokens',
      params: [userAddress, this.claimableTokens],
    });
  }

  /**
   * @summary Claim specific protocol reward token balance.
   */
  public async claimBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<TransactionResponse> {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claimToken',
      params: [userAddress, tokenAddress],
    });
  }

  /**
   * @summary Get total token distribution in week.
   * @param {string} token address to check distribution for, either bb-a-USD or BAL
   * @param {number} timestamp unix timestamp of epoch to check, has to be exact
   * epoch timestamp
   */
  public async getTokensDistributedInWeek(
    token: string,
    timestamp: number,
    instance?: Contract
  ): Promise<string> {
    if (!instance) instance = this.getInstance();
    const amount = await instance.getTokensDistributedInWeek(token, timestamp);

    return formatUnits(amount, 18);
  }

  /**
   * @summary Get total veBAL supply at epoch.
   * @param {number} timestamp unix timestamp of epoch to check, has to be exact
   * epoch timestamp
   */
  public async getTotalSupply(
    timestamp: number,
    instance?: Contract
  ): Promise<string> {
    if (!instance) instance = this.getInstance();
    const amount = await instance.getTotalSupplyAtTimestamp(timestamp);

    return formatUnits(amount, 18);
  }
}
