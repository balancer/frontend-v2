import { bspToDec } from '@/composables/useNumbers';
import { balancer } from '@/lib/balancer.sdk';
import { indexOfAddress, selectByAddress } from '@/lib/utils';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

/**
 * Handles cases where tokens out are specified for the exit using SDK's
 * buildExitExactTokensOut function.
 */
export class ExactOutExitHandler implements ExitPoolHandler {
  exitRes?: ReturnType<PoolWithMethods['buildExitExactTokensOut']>;
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
    const { signer, tokenInfo, slippageBsp, amountsOut, bptIn } = params;
    const sdkPool = await balancer.pools.find(this.pool.value.id);
    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);

    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');

    const tokenOutAddress = tokenOut.address;
    const evmAmountOut = parseFixed(
      amountsOut[0].value,
      tokenOut.decimals
    ).toString();

    const tokenOutIndex = indexOfAddress(this.allPoolTokens, tokenOutAddress);

    const fullAmountsOut = this.getFullAmounts(
      this.allPoolTokens,
      tokenOutIndex,
      evmAmountOut
    );

    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();

    this.exitRes = await sdkPool.buildExitExactTokensOut(
      exiter,
      this.allPoolTokens,
      fullAmountsOut,
      slippage
    );
    if (!this.exitRes) throw new Error('Failed to construct exit.');

    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const isJoin = false;
    const minAmountsOut = this.exitRes.minAmountsOut;

    const priceImpact = await sdkPool.calcPriceImpact(
      minAmountsOut,
      this.exitRes.maxBPTIn,
      isJoin
    );

    const scaledPriceImpact = formatFixed(priceImpact, 18);

    return {
      amountsOut: { [tokenOutAddress]: minAmountsOut[0] },
      priceImpact: Number(scaledPriceImpact),
    };
  }

  private getFullAmounts(
    poolTokens: string[],
    tokenOutIndex: number,
    tokenOutAmount: string
  ): string[] {
    // Set token amounts to 0
    const allPoolTokensAmounts = poolTokens.map(() => '0');
    // Set the exit token amount to tokenOutAmount
    allPoolTokensAmounts[tokenOutIndex] = tokenOutAmount || '0';
    return allPoolTokensAmounts;
  }
}
