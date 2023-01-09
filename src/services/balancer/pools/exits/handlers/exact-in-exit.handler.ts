import { bspToDec } from '@/composables/useNumbers';
import { balancer } from '@/lib/balancer.sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { indexOfAddress, selectByAddress } from '@/lib/utils';

/**
 * Handles cases where BPT in is set for the exit using SDK's
 * buildExitExactBPTIn function.
 */
export class ExactInExitHandler implements ExitPoolHandler {
  exitRes?: ReturnType<PoolWithMethods['buildExitExactBPTIn']>;
  private allPoolTokens: string[];

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {
    this.allPoolTokens = this.pool.value.tokens.map(token => token.address);
  }

  async exit(params: ExitParams): Promise<any> {
    // async exit(params: ExitParams): Promise<TransactionResponse> {
    return;
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, tokenInfo, bptIn, slippageBsp, amountsOut } = params;
    const sdkPool = await balancer.pools.find(this.pool.value.id);
    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);

    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');

    const tokenOutAddress = tokenOut.address;
    const tokenOutIndex = indexOfAddress(this.allPoolTokens, tokenOutAddress);

    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const shouldUnwrapNativeAsset = false;
    const singleTokenMaxOut =
      amountsOut.length === 1
        ? // TODO: Have to use lowercase address? Fix this in the SDK
          tokenOutAddress.toLowerCase()
        : undefined;

    const evmBptIn = parseFixed(bptIn, 18).toString();

    this.exitRes = await sdkPool?.buildExitExactBPTIn(
      exiter,
      evmBptIn,
      slippage,
      shouldUnwrapNativeAsset,
      singleTokenMaxOut
    );
    if (!this.exitRes) throw new Error('Failed to construct exit.');

    // TODO: Amounts out is minAmountsOut, but how to get token addresses out (use tokenlist from the pool)
    // These handler work for other pool types too? Weighted, linear, etc. (works with weighted and stable pools)

    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const minAmountsOut = this.exitRes.minAmountsOut;
    const minAmountOut = minAmountsOut[tokenOutIndex];
    const minAmountScaled = formatFixed(
      minAmountOut,
      tokenOut.decimals
    ).toString();
    const priceImpact = await sdkPool?.calcPriceImpact(
      minAmountsOut,
      evmBptIn,
      false
    );
    const scaledPriceImpact = formatFixed(priceImpact, 18);

    return {
      amountsOut: { [tokenOutAddress]: minAmountScaled },
      priceImpact: Number(scaledPriceImpact),
    };
  }
}
