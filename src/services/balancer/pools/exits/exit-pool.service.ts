import { getBalancerSDK } from '@/dependencies/balancer-sdk';
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
import { ExactInExitHandler } from './handlers/exact-in-exit.handler';
import { ExactOutExitHandler } from './handlers/exact-out-exit.handler';
import { RecoveryExitHandler } from './handlers/recovery-exit.handler';
import { PoolWithMethods } from '@balancer-labs/sdk';

export enum ExitHandler {
  Swap = 'Swap',
  Generalised = 'Generalised',
  ExactOut = 'ExactOut',
  ExactIn = 'ExactIn',
  Recovery = 'Recovery',
}

/**
 * ExitPoolService acts as an adapter to underlying handlers based on the pool
 * type or other criteria. It wraps calls to the functions defined in the
 * ExitPoolHandler interface.
 */
export class ExitPoolService {
  // The exit pool handler class to call exit pool interface functions.
  public exitHandler: ExitPoolHandler;
  public exitHandlerMap: Record<ExitHandler, ExitPoolHandler>;

  /**
   * Initialize the ExitPoolService
   *
   * @param {Pool} pool - The pool you want to exit.
   * @param {BalancerSDK} sdk - Balancers SDK.
   */
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdkPool: PoolWithMethods,
    public readonly sdk = getBalancerSDK()
  ) {
    this.exitHandlerMap = {
      [ExitHandler.Swap]: new SwapExitHandler(pool, sdkPool, sdk),
      [ExitHandler.Generalised]: new GeneralisedExitHandler(pool, sdkPool, sdk),
      [ExitHandler.ExactIn]: new ExactInExitHandler(pool, sdkPool, sdk),
      [ExitHandler.ExactOut]: new ExactOutExitHandler(pool, sdkPool, sdk),
      [ExitHandler.Recovery]: new RecoveryExitHandler(pool, sdkPool, sdk),
    };
    this.exitHandler = this.setExitHandler(ExitHandler.Generalised);
  }

  /**
   * Sets ExitHandler class on instance.
   *
   * @param {ExitHandler} type - The type of exit handler to use.
   * @returns {ExitPoolHandler} The ExitPoolHandler class to be used.
   */
  setExitHandler(type: ExitHandler): ExitPoolHandler {
    return (this.exitHandler = this.exitHandlerMap[type]);
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
