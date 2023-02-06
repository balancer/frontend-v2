import { getBalancer } from '@/dependencies/balancer-sdk';
import {
  GasPriceService,
  gasPriceService,
} from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { SwapExitHandler } from './handlers/swap-exit.handler';
import { GeneralisedExitHandler } from './handlers/generalised-exit.handler';
import {
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
} from './handlers/exit-pool.handler';
import { BalancerSDK } from '@balancer-labs/sdk';
import { ExactInExitHandler } from './handlers/exact-in-exit.handler';
import { ExactOutExitHandler } from './handlers/exact-out-exit.handler';

export enum ExitHandler {
  Swap,
  Generalised,
  ExactOut,
  ExactIn,
}

type HandlerParams = [Ref<Pool>, BalancerSDK, GasPriceService];

/**
 * ExitPoolService acts as an adapter to underlying handlers based on the pool
 * type or other criteria. It wraps calls to the functions defined in the
 * ExitPoolHandler interface.
 */
export class ExitPoolService {
  // The exit pool handler class to call exit pool interface functions.
  public exitHandler: ExitPoolHandler;

  /**
   * Initialize the ExitPoolService
   *
   * @param {Pool} pool - The pool you want to exit.
   * @param {BalancerSDK} sdk - Balancers SDK.
   * @param {GasPriceService} gasPriceServ - Gas price service for fetching gas price.
   */
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk = getBalancer(),
    public readonly gasPriceServ = gasPriceService
  ) {
    this.exitHandler = this.setExitHandler(ExitHandler.Generalised);
  }

  /**
   * Sets ExitHandler class on instance.
   *
   * @param {ExitHandler} type - The type of exit handler to use.
   * @returns {ExitPoolHandler} The ExitPoolHandler class to be used.
   */
  setExitHandler(type: ExitHandler): ExitPoolHandler {
    const { pool, sdk, gasPriceServ } = this;
    const handlerParams: HandlerParams = [pool, sdk, gasPriceServ];

    switch (type) {
      case ExitHandler.Swap:
        return (this.exitHandler = new SwapExitHandler(...handlerParams));
      case ExitHandler.Generalised:
        return (this.exitHandler = new GeneralisedExitHandler(
          ...handlerParams
        ));
      case ExitHandler.ExactIn:
        return (this.exitHandler = new ExactInExitHandler(...handlerParams));
      case ExitHandler.ExactOut:
        return (this.exitHandler = new ExactOutExitHandler(...handlerParams));
      default:
        throw new Error(`Pool type not handled: ${pool.value.poolType}`);
    }
  }

  /**
   * Executes an exit pool transaction.
   *
   * @param ...
   * @returns {TransactionResponse} The ethers transaction response object.
   */
  async exit(params: ExitParams): Promise<TransactionResponse> {
    return this.exitHandler.exit(params);
  }

  /**
   * Performs a query join to fetch the expected output from a join transaction.
   *
   * @param ...
   */
  async queryExit(params: ExitParams): Promise<QueryOutput> {
    return this.exitHandler.queryExit(params);
  }
}
