import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { fiatValueOf } from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { JoinPoolHandler, QueryOutput } from './join-pool.handler';

export class DeepPoolHandler implements JoinPoolHandler {
  private;
  constructor(
    public readonly pool: Pool,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async getTx(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<TransactionReceipt> {
    // All the logic for handling deep pool joins starts here.
    throw new Error('Tx fn not handled yet');
  }

  async queryTx(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput> {
    if (amountsIn.length === 0) throw new Error('Must provider amountsIn');

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
    const priceIn = prices[amountIn.address].usd;
    if (!tokenIn) throw new Error('Must provide token meta for amountIn');
    if (!priceIn) throw new Error('Must provide token price for amountIn');
    if (!amountIn.value || bnum(amountIn.value).eq(0))
      return { bptOut: '0', priceImpact: 0 };

    this.sdk.swaps.fetchPools();

    const safeAmount = overflowProtected(amountIn.value, tokenIn.decimals);
    const bnumAmount = parseFixed(safeAmount, tokenIn.decimals);
    const gasPrice = await this.getGasPrice();

    console.log('INPUTS', [bnumAmount.toString(), gasPrice.toString()]);

    const route = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: amountIn.address,
      tokenOut: this.pool.address,
      amount: bnumAmount,
      gasPrice,
      maxPools: 4,
    });

    console.log('route', route);

    const bptOut = formatFixed(
      route.returnAmountFromSwaps,
      this.pool.onchain?.decimals || 18
    );
    const fiatValueIn = fiatValueOf(this.pool, bptOut);
    const fiatValueOut = bnum(priceIn).times(amountIn.value).toString();
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
}
