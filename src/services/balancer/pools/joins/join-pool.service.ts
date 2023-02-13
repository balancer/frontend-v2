import { isDeep } from '@/composables/usePool';
import { getBalancer } from '@/dependencies/balancer-sdk';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
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
   * @param {GasPriceService} gasPriceServ - Gas price service for fetching gas price.
   */
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk = getBalancer(),
    public readonly gasPriceServ = gasPriceService
  ) {
    this.joinHandler = this.setJoinHandler();
  }

  /**
   * Sets JoinHandler class on instance.
   *
   * @param {boolean} [swapJoin=false] - Flag to ensure SwapJoinHandler is used for joining.
   * @returns {JoinPoolHandler} The JoinPoolHandler class to be used.
   */
  setJoinHandler(swapJoin = false): JoinPoolHandler {
    const { pool, sdk, gasPriceServ } = this;

    if (swapJoin) {
      return (this.joinHandler = new SwapJoinHandler(pool, sdk, gasPriceServ));
    } else if (isDeep(pool.value)) {
      return (this.joinHandler = new GeneralisedJoinHandler(
        pool,
        sdk,
        gasPriceServ
      ));
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
   * @param {Signer} params.signer - Ethers Signer for executing the transaction.
   * @param {number} params.slippageBsp - User's slippage setting in basis points.
   * @returns {QueryOutput} Query output object.
   */
  async queryJoin(params: JoinParams): Promise<QueryOutput> {
    return this.joinHandler.queryJoin(params);
  }
}
