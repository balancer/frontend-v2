import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';

import LiquidityGaugeRewardHelperAbi from '@/lib/abi/LiquidityGaugeHelperAbi.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';

export class LiquidityGaugeRewardsHelper {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = LiquidityGaugeRewardHelperAbi,
    private readonly walletService = walletServiceInstance
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  /**
   * @summary Claim all user's reward tokens on L2
   */
  async claimRewardsForGauge(
    gaugeAddress: string,
    userAddress: string
  ): Promise<TransactionResponse> {
    return await this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claimRewardsFromGauge',
      params: [gaugeAddress, userAddress],
    });
  }
}
