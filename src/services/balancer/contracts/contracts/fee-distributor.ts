import { TransactionResponse } from '@ethersproject/abstract-provider';

import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import { configService } from '@/services/config/config.service';
import { web3Service } from '@/services/web3/web3.service';

export class FeeDistributor {
  public claimableTokens: string[] = [
    '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2', // bb-a-USD
    '0xba100000625a3754423978a60c9317c58a424e3D' // BAL
  ];

  constructor(
    private readonly abi = FeeDistributorABI,
    private readonly config = configService,
    private readonly web3 = web3Service,
    public readonly address = config.network.addresses.feeDistributor
  ) {}

  /**
   * @summary Get claimable protocol fee reward balances
   * @descrition To get claimable balances we have to simulate a transaction to
   * the claimTokens method by modifing the ABI to make it a view function.
   */
  async getClaimableBalances(
    userAddress: string
  ): Promise<TransactionResponse> {
    const abi = { name: 'claimTokens', type: 'view' };
    return await this.web3.sendTransaction(this.address, abi, 'claimTokens', [
      userAddress,
      this.claimableTokens
    ]);
  }
}

export const feeDistributor = new FeeDistributor();
