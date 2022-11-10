import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

/**
 * Handles exits for single asset flows where we need to use a BatchSwap to exit
 * the pool.
 */
export class DeepExitHandler implements ExitPoolHandler {
  private lastSwapRoute?: SwapInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit({
    signer,
    slippageBsp,
  }: ExitParams): Promise<TransactionResponse> {
    console.log(signer, slippageBsp);
    throw new Error('To be implemented');
  }

  async queryExit(): Promise<QueryOutput> {
    throw new Error('To be implemented');
  }

  async getSingleAssetMax(): Promise<string> {
    throw new Error('n/a to this exit type.');
  }

  /**
   * PRIVATE
   */
  private async getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await this.gasPriceService.getGasPrice();
    if (!gasPriceParams) throw new Error('Failed to fetch gas price.');

    return BigNumber.from(gasPriceParams.price);
  }
}
