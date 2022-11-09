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
import { isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePool';

interface GeneralisedExitResponse {
  to: string;
  callData: string;
  tokensOut: string[];
  expectedAmountsOut: string[];
  minAmountsOut: string[];
  // priceImpact: string;
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

  async exit({
    signer,
    slippageBsp,
  }: ExitParams): Promise<TransactionResponse> {
    console.log(signer, slippageBsp);
    throw new Error('To be implemented');
  }

  async queryExit({
    amount,
    signer,
    slippageBsp,
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
        const scaledAmount = formatFixed(
          amount,
          token.decimals ?? 18
        ).toString();
        tokensOut[token.address] = scaledAmount;
      }
    });

    return {
      priceImpact: 0,
      tokensOut,
    };
  }
}
