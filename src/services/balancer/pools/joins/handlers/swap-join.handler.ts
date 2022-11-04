import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { fiatValueOf } from '@/composables/usePool';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum } from '@/lib/utils';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';

/**
 * Handles joins for single asset flows where we need to use a BatchSwap to join
 * the pool.
 */
export class SwapJoinHandler implements JoinPoolHandler {
  private lastSwapRoute?: SwapInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async join({
    amountsIn,
    tokensIn,
    prices,
    signer,
    slippageBsp,
  }: JoinParams): Promise<TransactionResponse> {
    const userAddress = await signer.getAddress();
    await this.queryJoin({ amountsIn, tokensIn, prices, signer, slippageBsp });
    if (!this.lastSwapRoute)
      throw new Error('Could not fetch swap route for join.');

    const swap = this.getSwapAttributes(
      this.lastSwapRoute,
      slippageBsp,
      userAddress
    );

    const { kind, swaps, assets, funds, limits } = swap.attributes as BatchSwap;
    return vaultService.batchSwap(
      kind,
      swaps,
      assets,
      funds,
      limits as string[]
    );
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    prices,
  }: JoinParams): Promise<QueryOutput> {
    if (amountsIn.length === 0)
      throw new Error('Missing amounts to join with.');

    const amountIn = amountsIn[0];
    const tokenIn = tokensIn[amountIn.address];
    const priceIn = prices[amountIn.address]?.usd;
    if (!tokenIn) throw new Error('Missing critical token metadata.');
    if (!priceIn) throw new Error('Missing price for token to join with.');
    if (!amountIn.value || bnum(amountIn.value).eq(0))
      return { bptOut: '0', priceImpact: 0 };

    if (!hasFetchedPoolsForSor) await fetchPoolsForSor();

    const safeAmount = overflowProtected(amountIn.value, tokenIn.decimals);
    const bnumAmount = parseFixed(safeAmount, tokenIn.decimals);
    const gasPrice = await this.getGasPrice();

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: amountIn.address,
      tokenOut: this.pool.value.address,
      amount: bnumAmount,
      gasPrice,
      maxPools: 4,
    });

    const bptOut = formatFixed(
      this.lastSwapRoute.returnAmountFromSwaps,
      this.pool.value.onchain?.decimals || 18
    );
    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');

    const fiatValueIn = bnum(priceIn).times(amountIn.value).toString();
    const fiatValueOut = fiatValueOf(this.pool.value, bptOut);

    const priceImpact = this.calcPriceImpact(fiatValueIn, fiatValueOut);

    return { bptOut, priceImpact };
  }

  /**
   * PRIVATE
   */
  private calcPriceImpact(fiatValueIn: string, fiatValueOut: string): number {
    const _fiatValueIn = bnum(fiatValueIn);
    const _fiatValueOut = bnum(fiatValueOut);

    // Don't return negative price impact
    return Math.max(
      0,
      _fiatValueIn
        .minus(_fiatValueOut)
        .div(_fiatValueIn.plus(_fiatValueOut).div(bnum(2)))
        .toNumber() || 1 // If fails to calculate return error value of 100%
    );
  }

  private async getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await this.gasPriceService.getGasPrice();
    if (!gasPriceParams) throw new Error('Failed to fetch gas price.');

    return BigNumber.from(gasPriceParams.price);
  }

  private getSwapAttributes(
    swapInfo: SwapInfo,
    maxSlippage: number,
    userAddress: string
  ) {
    const deadline = BigNumber.from(getTimestampSecondsFromNow(60)); // 60 seconds from now
    return this.sdk.swaps.buildSwap({
      userAddress,
      swapInfo,
      kind: 0,
      deadline,
      maxSlippage,
    });
  }
}
