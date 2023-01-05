import { isDeep } from '@/composables/usePool';
import { balancer } from '@/lib/balancer.sdk';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
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
    public readonly sdk = balancer,
    public readonly gasPriceServ = gasPriceService
  ) {
    this.exitHandler = this.setExitHandler();
  }

  /**
   * Sets ExitHandler class on instance.
   *
   * @param {boolean} [swapExit=false] - Flag to ensure SwapExitHandler is used for exiting.
   * @returns {ExitPoolHandler} The ExitPoolHandler class to be used.
   */
  setExitHandler(swapJoin = false): ExitPoolHandler {
    const { pool, sdk, gasPriceServ } = this;

    if (swapJoin) {
      return (this.exitHandler = new SwapExitHandler(pool, sdk, gasPriceServ));
    } else if (isDeep(pool.value)) {
      return (this.exitHandler = new GeneralisedExitHandler(
        pool,
        sdk,
        gasPriceServ
      ));
    } else {
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
