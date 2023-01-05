import { bspToDec } from '@/composables/useNumbers';
import { balancer } from '@/lib/balancer.sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

/**
 * Handles cases where BPT in is set for the exit using SDK's
 * buildExitExactBPTIn function.
 */
export class ExactInExitHandler implements ExitPoolHandler {
  exitRes?: ReturnType<PoolWithMethods['buildExitExactBPTIn']>;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {}

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, bptIn, slippageBsp, amountsOut } = params;
    const sdkPool = await balancer.pools.find(this.pool.value.id);

    const exiter = await signer.getAddress();
    const slippage = bspToDec(slippageBsp).toString();
    const shouldUnwrapNativeAsset = false;
    const singleTokenMaxOut =
      amountsOut.length === 1 ? amountsOut[0].address : undefined;

    this.exitRes = await sdkPool?.buildExitExactBPTIn(
      exiter,
      bptIn,
      slippage,
      shouldUnwrapNativeAsset,
      singleTokenMaxOut
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
