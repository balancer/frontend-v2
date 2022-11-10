import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import {
  TokensOut,
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
} from './exit-pool.handler';
import { balancer } from '@/lib/balancer.sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { fiatValueOf, flatTokenTree } from '@/composables/usePool';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { getAddress } from '@ethersproject/address';

interface GeneralisedExitResponse {
  to: string;
  callData: string;
  tokensOut: string[];
  expectedAmountsOut: string[];
  minAmountsOut: string[];
}

/**
 * Handles exits for single asset flows where we need to use a BatchSwap to exit
 * the pool.
 */
export class DeepExitHandler implements ExitPoolHandler {
  private lastGeneralisedExitRes?: GeneralisedExitResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    const { signer } = params;
    await this.queryExit(params);
    if (!this.lastGeneralisedExitRes) {
      throw new Error('Could not query generalised join');
    }
    const { to, callData } = this.lastGeneralisedExitRes;
    return signer.sendTransaction({
      to,
      data: callData,
    });
  }

  async queryExit({
    amount,
    signer,
    slippageBsp,
    prices,
    relayerSignature,
  }: ExitParams): Promise<QueryOutput> {
    const parsedAmount = parseFixed(
      amount || '0',
      this.pool.value.onchain?.decimals ?? 18
    ).toString();

    const signerAddress = await signer.getAddress();

    const slippage = slippageBsp.toString();
    const poolId = this.pool.value.id;

    this.lastGeneralisedExitRes = await balancer.pools
      .generalisedExit(
        poolId,
        parsedAmount,
        signerAddress,
        slippage,
        relayerSignature
      )
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });
    console.log({ lastGeneralisedExitRes: this.lastGeneralisedExitRes });

    if (!this.lastGeneralisedExitRes) throw new Error('Not enough liquidity.');

    const tokenAddressesOut = this.lastGeneralisedExitRes.tokensOut;
    const allPoolTokens = flatTokenTree(this.pool.value.tokens);
    const tokensOut: TokensOut = {};

    this.lastGeneralisedExitRes.expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, tokenAddressesOut[i])
      );
      if (token) {
        const realAddress = getAddress(token.address);
        const scaledAmount = formatFixed(
          amount,
          token.decimals ?? 18
        ).toString();
        tokensOut[realAddress] = scaledAmount;
      }
    });

    const fiatValueOut = this.getFiatValueOut(tokensOut, prices);
    const fiatValueIn = fiatValueOf(this.pool.value, amount);
    const priceImpact = this.calcPriceImpact(fiatValueIn, fiatValueOut);

    return {
      priceImpact,
      tokensOut,
    };
  }

  /**
   * PRIVATE
   */
  private getFiatValueOut(tokensOut: TokensOut, prices: TokenPrices): string {
    let fiatValueOut = '0';

    for (const token in tokensOut) {
      const price = prices[token]?.usd;
      fiatValueOut = bnum(fiatValueOut)
        .plus(bnum(price).times(tokensOut[token]))
        .toString();
    }
    return fiatValueOut;
  }

  private calcPriceImpact(fiatValueIn: string, fiatValueOut: string): number {
    const _fiatValueIn = bnum(fiatValueIn);
    const _fiatValueOut = bnum(fiatValueOut);

    if (_fiatValueIn.eq(_fiatValueOut)) {
      return 0;
    }

    // Don't return negative price impact
    return Math.max(
      0,
      _fiatValueIn
        .minus(_fiatValueOut)
        .div(_fiatValueIn.plus(_fiatValueOut).div(bnum(2)))
        .toNumber() ?? 1 // If fails to calculate return error value of 100%
    );
  }
}
