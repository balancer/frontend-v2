import { getBalancer } from '@/dependencies/balancer-sdk';
import { indexOfAddress, selectByAddress } from '@/lib/utils';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

/**
 * Handles cases where tokens out are specified for the exit using SDK's
 * buildExitExactTokensOut function.
 */
export class ExactOutExitHandler implements ExitPoolHandler {
  private lastExitRes?: ReturnType<PoolWithMethods['buildExitExactTokensOut']>;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, data } = this.lastExitRes;

    return txBuilder.raw.sendTransaction({ to, data });
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, tokenInfo, slippageBsp, amountsOut } = params;
    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await getBalancer().pools.find(this.pool.value.id);
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');

    const tokenOutAddress = tokenOut.address;
    const tokenOutIndex = indexOfAddress(
      this.pool.value.tokensList,
      tokenOutAddress
    );

    const amountOut = amountsOut[0].value;
    const evmAmountOut = parseFixed(amountOut, tokenOut.decimals).toString();

    const fullAmountsOut = this.getFullAmounts(
      this.pool.value.tokensList,
      tokenOutIndex,
      evmAmountOut
    );

    this.lastExitRes = await sdkPool.buildExitExactTokensOut(
      exiter,
      this.pool.value.tokensList,
      fullAmountsOut,
      slippage
    );
    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const evmPriceImpact = await sdkPool.calcPriceImpact(
      fullAmountsOut,
      this.lastExitRes.expectedBPTIn,
      false
    );

    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    return {
      amountsOut: { [tokenOutAddress]: amountOut },
      priceImpact,
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
