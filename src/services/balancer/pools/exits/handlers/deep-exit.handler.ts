import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import {
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
  AmountsOut,
} from './exit-pool.handler';
import { balancer } from '@/lib/balancer.sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePool';
import { getAddress } from '@ethersproject/address';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

interface GeneralisedExitResponse {
  to: string;
  callData: string;
  tokensOut: string[];
  expectedAmountsOut: string[];
  minAmountsOut: string[];
  priceImpact: string;
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
    const txBuilder = new TransactionBuilder(signer);
    const { to, callData } = this.lastGeneralisedExitRes;
    return txBuilder.raw.sendTransaction({ to, data: callData });
  }

  async queryExit({
    bptIn,
    signer,
    slippageBsp,
    relayerSignature,
  }: ExitParams): Promise<QueryOutput> {
    const bnumAmount = parseFixed(
      bptIn || '0',
      this.pool.value.onchain?.decimals ?? 18
    );

    if (bnumAmount.lte(0)) throw new Error('BPT in amount is 0.');

    const signerAddress = await signer.getAddress();

    const slippage = slippageBsp.toString();
    const poolId = this.pool.value.id;

    this.lastGeneralisedExitRes = await balancer.pools
      .generalisedExit(
        poolId,
        bnumAmount.toString(),
        signerAddress,
        slippage,
        relayerSignature
      )
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });
    if (!this.lastGeneralisedExitRes) throw new Error('Not enough liquidity.');

    const tokenAddressesOut = this.lastGeneralisedExitRes.tokensOut;
    const allPoolTokens = flatTokenTree(this.pool.value);
    const amountsOut: AmountsOut = {};

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
        amountsOut[realAddress] = scaledAmount;
      }
    });

    const priceImpact: number = bnum(
      formatFixed(this.lastGeneralisedExitRes.priceImpact, 18)
    ).toNumber();

    return {
      priceImpact,
      amountsOut,
    };
  }
}
