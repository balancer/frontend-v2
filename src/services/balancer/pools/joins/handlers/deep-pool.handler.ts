import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { fiatValueOf } from '@/composables/usePool';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum } from '@/lib/utils';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK, BatchSwap, SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';

export class DeepPoolHandler implements JoinPoolHandler {
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
    await this.queryJoin(amountsIn, tokensIn, prices);
    if (!this.lastSwapRoute)
      throw new Error('Could not fetch swap route for join');

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

  async queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    if (amountsIn.length === 0) throw new Error('Must provide amountsIn');

    if (amountsIn.length === 1) {
      return this.querySingleAssetJoin(amountsIn[0], tokensIn, prices);
    } else {
      // Multi asset join
      throw new Error('Multi asset not handled yet');
    }
  }

  private async querySingleAssetJoin(
    amountIn: AmountIn,
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    const tokenIn = tokensIn[amountIn.address];
    const priceIn = prices[amountIn.address]?.usd;
    if (!tokenIn) throw new Error('Must provide token meta for amountIn');
    if (!priceIn) throw new Error('Must provide token price for amountIn');
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
    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity');

    const fiatValueIn = bnum(priceIn).times(amountIn.value).toString();
    const fiatValueOut = fiatValueOf(this.pool.value, bptOut);

    const priceImpact = this.calcPriceImpact(fiatValueIn, fiatValueOut);

    return { bptOut, priceImpact };
  }

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
    if (!gasPriceParams) throw new Error('Failed to fetch gas price');

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
