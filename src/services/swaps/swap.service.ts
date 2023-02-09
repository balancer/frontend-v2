/**
 * @name SwapService
 *
 * SwapsService acts as an adapter to underlying handlers based on the selected
 * swap protocol. It wraps calls to the functions defined in the SwapHandler interface.
 */
import { getBalancer } from '@/dependencies/balancer-sdk';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  QueryOutput,
  SwapHandler,
  SwapParams,
} from './handlers/abstract-swap.handler';

/**
 * TYPES
 */
enum SwapProtocol {
  Balancer,
  Cowswap,
}

type HandlerParams = [BalancerSDK];

export class SwapService {
  // The swap handler class to call swap interface functions.
  public swapHandler: SwapHandler;

  /**
   * Initialize the SwapsService
   *
   * @param {BalancerSDK} sdk - Balancers SDK.
   */
  constructor(public readonly sdk = getBalancer()) {
    this.swapHandler = this.setSwapHandler(SwapProtocol.Balancer);
  }

  /**
   * Sets ExitHandler class on instance.
   *
   * @param {ExitHandler} type - The type of exit handler to use.
   * @returns {ExitPoolHandler} The ExitPoolHandler class to be used.
   */
  setSwapHandler(handler: SwapProtocol): SwapHandler {
    const { sdk } = this;
    const handlerParams: HandlerParams = [sdk];

    switch (handler) {
      case SwapProtocol.Balancer:
        return (this.swapHandler = new BalancerSwapHandler(...handlerParams));
      case SwapProtocol.Cowswap:
        return (this.swapHandler = new CowSwapHandler(...handlerParams));
      default:
        throw new Error(`Handler not handled: ${handler}`);
    }
  }

  /**
   * Executes a join pool transaction.
   *
   * @returns {TransactionResponse} The ethers transaction response object.
   */
  async swap(params: SwapParams): Promise<TransactionResponse> {
    return this.swapHandler.swap(params);
  }

  /**
   * Performs a query join to fetch the expected output from a join transaction.
   *
   * @returns {QueryOutput} Query output object.
   */
  async querySwap(params: SwapParams): Promise<QueryOutput> {
    return this.swapHandler.querySwap(params);
  }
}
