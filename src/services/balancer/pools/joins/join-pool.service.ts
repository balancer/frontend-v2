import { isDeep } from '@/composables/usePool';
import { balancer } from '@/lib/balancer.sdk';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { SwapJoinHandler } from './handlers/swap-join.handler';
import {
  JoinParams,
  JoinPoolHandler,
  QueryOutput,
} from './handlers/join-pool.handler';
import { GeneralizedJoinHandler } from './handlers/generalized-join.handler';

/**
 * JoinPoolService acts as an adapter to underlying handlers based on the pool
 * type or other criteria. It wraps calls to the functions defined in the
 * JoinPoolHandler interface.
 */
export class JoinPoolService {
  // The handle class to call join pool interface functions.
  public joinHandler: JoinPoolHandler;

  /**
   * Initialize the JoinPoolService
   *
   * @param {Pool} pool - The pool you want to join.
   * @param {boolean} swapJoin - Flag to ensure SwapJoinHandler is used for joining.
   * @param {BalancerSDK} sdk - Balancers SDK.
   * @param {GasPriceService} gasPriceServ - Gas price service for fetching gas price.
   */
  constructor(
    pool: Ref<Pool>,
    swapJoin = false,
    sdk = balancer,
    gasPriceServ = gasPriceService
  ) {
    if (swapJoin) {
      this.joinHandler = new SwapJoinHandler(pool, sdk, gasPriceServ);
    } else if (isDeep(pool.value)) {
      this.joinHandler = new GeneralizedJoinHandler(pool, sdk, gasPriceServ);
    } else {
      throw new Error(`Pool type not handled: ${pool.value.poolType}`);
    }
  }

  /**
   * Executes a join pool transaction.
   *
   * @param {AmountIn[]} params.amountsIn - Array of token addresses and amounts
   * to join with.
   * @param {TokenInfoMap} params.tokensIn - Meta data for token addresses in amountsIn.
   * @param {TokenPrices} params.prices - Fiat prices for tokens in amountsIn.
   * @param {Signer} params.signer - Ethers Signer for executing the transaction.
   * @param {number} params.slippageBsp - User's slippage setting in basis points.
   * @returns {TransactionResponse} The ethers transaction response object.
   */
  async join(params: JoinParams): Promise<TransactionResponse> {
    return this.joinHandler.join(params);
  }

  /**
   * Performs a query join to fetch the expected output from a join transaction.
   *
   * @param {AmountIn[]} amountsIn - Array of token addresses and amounts
   * to join with.
   * @param {TokenInfoMap} tokensIn - Meta data for token addresses in amountsIn.
   * @param {TokenPrices} prices - Fiat prices for tokens in amountsIn.
   */
  async queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    return this.joinHandler.queryJoin(amountsIn, tokensIn, prices);
  }
}
