import { bspToDec } from '@/composables/useNumbers';
import { balancer } from '@/lib/balancer.sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

/**
 * Handles cases where tokens out are specified for the exit using SDK's
 * buildExitExactTokensOut function.
 */
export class ExactOutExitHandler implements ExitPoolHandler {
  exitRes?: ReturnType<PoolWithMethods['buildExitExactTokensOut']>;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {}

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, slippageBsp, amountsOut, bptIn } = params;
    const sdkPool = await balancer.pools.find(this.pool.value.id);

    const exiter = await signer.getAddress();
    const slippage = bspToDec(slippageBsp).toString();
    const tokensOut = []; // TODO
    const _amountsOut = []; // TODO

    this.exitRes = await sdkPool?.buildExitExactTokensOut(
      exiter,
      tokensOut,
      _amountsOut,
      slippage
    );
    if (!this.exitRes) throw new Error('Failed to construct exit.');

    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const isJoin = false;
    const minAmountsOut = this.exitRes.minAmountsOut;
    const priceImpact = await sdkPool?.calcPriceImpact(
      minAmountsOut,
      bptIn,
      isJoin
    );

    return {
      amountsOut: minAmountsOut,
      priceImpact,
    };
  }
}
