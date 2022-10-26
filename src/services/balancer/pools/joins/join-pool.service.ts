import { isDeep } from '@/composables/usePool';
import { balancer } from '@/lib/balancer.sdk';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { DeepPoolHandler } from './handlers/deep-pool.handler';
import {
  JoinParams,
  JoinPoolHandler,
  QueryOutput,
} from './handlers/join-pool.handler';

/**
 * JoinPoolService acts as an adapter to underlying handlers based on the pool
 * type. It provide highlevel access to the functions defined in the
 * JoinPoolHandler interface.
 */
export class JoinPoolService {
  // The handle class to call join pool interface functions.
  public joinHandler: JoinPoolHandler;

  /**
   * Initialize a JoinPoolService
   *
   * @param {Pool} pool - The pool you want to join.
   */
  constructor(pool: Pool, sdk = balancer, gasPriceServ = gasPriceService) {
    if (isDeep(pool)) {
      this.joinHandler = new DeepPoolHandler(pool, sdk, gasPriceServ);
    } else {
      throw new Error(`Pool type not handled: ${pool.poolType}`);
    }
  }

  async join(params: JoinParams): Promise<TransactionResponse> {
    return this.joinHandler.join(params);
  }

  async queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    return this.joinHandler.queryJoin(amountsIn, tokensIn, prices);
  }
}
