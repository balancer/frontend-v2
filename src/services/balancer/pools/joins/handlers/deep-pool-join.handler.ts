import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, selectByAddress } from '@/lib/utils';
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
    public readonly pool: Pool,
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
      const token = selectByAddress(tokensIn, address);

      if (!token?.decimals) throw new Error('Token decimals missing.');

      const parsedAmount = parseFixed(value || '0', token.decimals).toString();
      return parsedAmount;
    });

    const tokenAddresses: string[] = amountsIn.map(({ address }) => address);
    const signerAddress = await signer.getAddress();
    const wrapLeafTokens = false;
    const slippage = slippageBsp.toString();
    const poolId = this.pool.id;

    this.lastGeneralisedJoinRes = await this.sdk.pools
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
      this.pool.onchain?.decimals || 18
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
