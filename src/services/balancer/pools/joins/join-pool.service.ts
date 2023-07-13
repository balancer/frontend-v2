import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { Pool } from '@/services/pool/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { SwapJoinHandler } from './handlers/swap-join.handler';
import {
  JoinParams,
  JoinPoolHandler,
  QueryOutput,
} from './handlers/join-pool.handler';
import { GeneralisedJoinHandler } from './handlers/generalised-join.handler';

import { BalancerSDK } from '@sobal/sdk';
import { ExactInJoinHandler } from './handlers/exact-in-join.handler';

export enum JoinHandler {
  Swap = 'Swap',
  Generalised = 'Generalised',
  ExactIn = 'ExactIn',
}

type HandlerParams = [Ref<Pool>, BalancerSDK];
/**
 * JoinPoolService acts as an adapter to underlying handlers based on the pool
 * type or other criteria. It wraps calls to the functions defined in the
 * JoinPoolHandler interface.
 */
export class JoinPoolService {
  // The join pool handler class to call join pool interface functions.
  public joinHandler: JoinPoolHandler;

  /**
   * Initialize the JoinPoolService
   *
   * @param {Pool} pool - The pool you want to join.
   * @param {BalancerSDK} sdk - Balancers SDK.
   */
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk = getBalancerSDK()
  ) {
    this.joinHandler = this.setJoinHandler(JoinHandler.Generalised);
  }

  /**
   * Sets JoinHandler class on instance.
   *
   * @param {boolean} [swapJoin=false] - Flag to ensure SwapJoinHandler is used for joining.
   * @returns {JoinPoolHandler} The JoinPoolHandler class to be used.
   */
  setJoinHandler(type: JoinHandler): JoinPoolHandler {
    const { pool, sdk } = this;
    const handlerParams: HandlerParams = [pool, sdk];

    switch (type) {
      case JoinHandler.Swap:
        return (this.joinHandler = new SwapJoinHandler(...handlerParams));
      case JoinHandler.Generalised:
        return (this.joinHandler = new GeneralisedJoinHandler(
          ...handlerParams
        ));
      case JoinHandler.ExactIn:
        return (this.joinHandler = new ExactInJoinHandler(...handlerParams));
      default:
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
   * @param {Signer} params.signer - Ethers Signer for executing the transaction.
   * @param {number} params.slippageBsp - User's slippage setting in basis points.
   * @returns {QueryOutput} Query output object.
   */
  async queryJoin(params: JoinParams): Promise<QueryOutput> {
    return this.joinHandler.queryJoin(params);
  }
}
