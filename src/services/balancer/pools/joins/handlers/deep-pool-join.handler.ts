import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';

/**
 * Handles generalized joins for deep pools using SDK functions.
 */
export class DeepPoolJoinHandler implements JoinPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async join({
    amountsIn,
    tokensIn,
    prices,
    signer,
    slippageBsp,
  }: JoinParams): Promise<TransactionResponse> {
    console.log([amountsIn, tokensIn, prices, signer, slippageBsp]);
    throw new Error('To be implemented');
  }

  async queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    console.log([amountsIn, tokensIn, prices]);
    throw new Error('To be implemented');
  }
}
