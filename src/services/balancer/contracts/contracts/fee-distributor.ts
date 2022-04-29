import { BigNumber } from 'ethers';
import { zipObject } from 'lodash';

import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import FeeDistributorStaticABI from '@/lib/abi/FeeDistributorStatic.json';
import { configService } from '@/services/config/config.service';
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
    public readonly address = config.network.addresses.feeDistributor
  ) {}

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
}

export const feeDistributor = new FeeDistributor();
