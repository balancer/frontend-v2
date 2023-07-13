import { Pool } from '@/services/pool/types';
import { BalancerSDK, SimulationType } from '@sobal/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
  AmountsOut,
} from './exit-pool.handler';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePoolHelpers';
import { getAddress } from '@ethersproject/address';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

type BalancerSdkType = ReturnType<typeof getBalancerSDK>;
export type ExitResponse = Awaited<
  ReturnType<BalancerSdkType['pools']['generalisedExit']>
>;
export type ExitInfo = Awaited<
  ReturnType<BalancerSdkType['pools']['getExitInfo']>
>;

/**
 * Handles exits using SDK's generalisedExit function.
 */
export class GeneralisedExitHandler implements ExitPoolHandler {
  private exitTx?: ExitResponse;
  private exitInfo?: ExitInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.exitTx) {
      throw new Error('Could not query generalised exit');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, encodedCall } = this.exitTx;

    return txBuilder.raw.sendTransaction({ to, data: encodedCall });
  }

  async queryExit({
    bptIn,
    signer,
    slippageBsp,
    relayerSignature,
    approvalActions,
    bptInValid,
  }: ExitParams): Promise<QueryOutput> {
    const evmAmountIn = parseFixed(
      bptIn || '0',
      this.pool.value.onchain?.decimals ?? 18
    );
    if (evmAmountIn.lte(0)) throw new Error('BPT in amount is 0.');

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const isRelayerApproved =
      (bptInValid && approvalActions.length === 0) || !!relayerSignature;
    const balancer = getBalancerSDK();

    try {
      if (this.exitInfo && isRelayerApproved) {
        this.exitTx = await balancer.pools.generalisedExit(
          this.pool.value.id,
          evmAmountIn.toString(),
          signerAddress,
          slippage,
          signer,
          SimulationType.Static,
          relayerSignature,
          this.exitInfo.tokensToUnwrap
        );
      } else {
        this.exitInfo = await balancer.pools.getExitInfo(
          this.pool.value.id,
          evmAmountIn.toString(),
          signerAddress,
          signer
        );
      }
    } catch (error) {
      console.error(error);
      console.log('Failed here');
      throw new Error('Failed to query exit.');
    }

    if (!this.exitInfo && !this.exitTx)
      throw new Error('Failed to query exit.');

    const priceImpact: number = bnum(
      formatFixed(this.exitTx?.priceImpact || this.exitInfo.priceImpact, 18)
    ).toNumber();

    return {
      priceImpact,
      amountsOut: this.formatAmountsOut(
        this.exitTx?.expectedAmountsOut || this.exitInfo.estimatedAmountsOut,
        this.exitTx?.tokensOut || this.exitInfo.tokensOut
      ),
      txReady: !!this.exitTx,
    };
  }

  /**
   * PRIVATE METHODS
   */
  private formatAmountsOut(
    expectedAmountsOut: string[],
    tokensOut: string[]
  ): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);

    expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, tokensOut[i])
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
