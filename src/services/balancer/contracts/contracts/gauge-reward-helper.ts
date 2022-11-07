import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers';

import LiquidityGaugeRewardHelperAbi from '@/lib/abi/LiquidityGaugeHelperAbi.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';

export class LiquidityGaugeRewardsHelper {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = LiquidityGaugeRewardHelperAbi,
    private readonly config = configService,
    private readonly web3 = web3Service
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
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claimRewardsFromGauge()',
      params: [gaugeAddress, userAddress],
    });
  }

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }

  static getMulticaller(provider?: JsonRpcProvider): Multicaller {
    return new Multicaller(
      configService.network.key,
      provider || rpcProviderService.jsonProvider,
      LiquidityGaugeRewardHelperAbi
    );
  }
}
