import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { balancer } from '@/lib/balancer.sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { bnum } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

/**
 * Handles generalized joins for deep pools using SDK functions.
 */

interface GeneralisedJoinResponse {
  to: string;
  callData: string;
  minOut: string;
  expectedOut: string;
  priceImpact: string;
}
export class DeepPoolJoinHandler implements JoinPoolHandler {
  private lastGeneralisedJoinRes?: GeneralisedJoinResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async join(params: JoinParams): Promise<TransactionResponse> {
    const { signer } = params;
    await this.queryJoin(params);
    if (!this.lastGeneralisedJoinRes) {
      throw new Error('Could not query generalised join');
    }
    const txBuilder = new TransactionBuilder(signer);
    const { to, callData } = this.lastGeneralisedJoinRes;
    return txBuilder.raw.sendTransaction({ to, data: callData });
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    signer,
    slippageBsp,
    relayerSignature,
  }: JoinParams): Promise<QueryOutput> {
    const parsedAmountsIn: string[] = amountsIn.map(({ address, value }) => {
      // Get the address in right casing style
      const realAddress = getAddress(address);
      const token = tokensIn[realAddress];

      if (!token.decimals) throw new Error('Token decimals missing.');

      const parsedAmount = parseFixed(value || '0', token.decimals).toString();
      return parsedAmount;
    });

    const tokenAddresses: string[] = amountsIn.map(({ address }) => address);
    const signerAddress = await signer.getAddress();
    const wrapLeafTokens = false;
    const slippage = slippageBsp.toString();
    const poolId = this.pool.value.id;

    this.lastGeneralisedJoinRes = await balancer.pools
      .generalisedJoin(
        poolId,
        tokenAddresses,
        parsedAmountsIn,
        signerAddress,
        wrapLeafTokens,
        slippage,
        relayerSignature
      )
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });

    if (!this.lastGeneralisedJoinRes) {
      throw new Error('Failed to fetch expected output.');
    }
    const bptOut = formatFixed(
      this.lastGeneralisedJoinRes.expectedOut,
      this.pool.value.onchain?.decimals || 18
    );
    const priceImpact: number = bnum(
      formatFixed(this.lastGeneralisedJoinRes.priceImpact, 18)
    ).toNumber();

    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');
    return {
      bptOut,
      priceImpact,
    };
  }
}
