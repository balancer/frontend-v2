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
import { getBalancer } from '@/dependencies/balancer-sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePool';
import { getAddress } from '@ethersproject/address';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

const balancer = getBalancer();
type ExitResponse = Awaited<ReturnType<typeof balancer.pools.generalisedExit>>;

/**
 * Handles exits using SDK's generalisedExit function.
 */
export class GeneralisedExitHandler implements ExitPoolHandler {
  private lastExitRes?: ExitResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) {
      throw new Error('Could not query generalised exit');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, callData } = this.lastExitRes;

    return txBuilder.raw.sendTransaction({ to, data: callData });
  }

  async queryExit({
    bptIn,
    signer,
    slippageBsp,
    relayerSignature,
  }: ExitParams): Promise<QueryOutput> {
    const evmAmountIn = parseFixed(
      bptIn || '0',
      this.pool.value.onchain?.decimals ?? 18
    );

    if (evmAmountIn.lte(0)) throw new Error('BPT in amount is 0.');

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();

    this.lastExitRes = await balancer.pools.generalisedExit(
      this.pool.value.id,
      evmAmountIn.toString(),
      signerAddress,
      slippage,
      relayerSignature
    );
    if (!this.lastExitRes) throw new Error('Failed to query exit.');

    const priceImpact: number = bnum(
      formatFixed(this.lastExitRes.priceImpact, 18)
    ).toNumber();

    return {
      priceImpact,
      amountsOut: this.formatAmountsOut(this.lastExitRes),
    };
  }

  /**
   * PRIVATE METHODS
   */
  private formatAmountsOut(exitRes: ExitResponse): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);

    exitRes.expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, exitRes.tokensOut[i])
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

    return amountsOut;
  }
}
