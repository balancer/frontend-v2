import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { balancer } from '@/lib/balancer.sdk';
import { Signer } from '@ethersproject/abstract-signer';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { bnum } from '@/lib/utils';

/**
 * Handles generalized joins for deep pools using SDK functions.
 */

interface GeneralisedJoinResponse {
  to: string;
  callData: string;
  minOut: string;
  expectedOut: string;
  // priceImpact: string;
}
export class DeepPoolJoinHandler implements JoinPoolHandler {
  private lastGeneralisedJoinRes?: GeneralisedJoinResponse;

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
    console.log([amountsIn, tokensIn, prices, signer, slippageBsp]);
    throw new Error('To be implemented');
  }

  async queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices,
    signer: Signer
  ): Promise<QueryOutput> {
    const parsedAmountsIn: string[] = amountsIn.map(({ address, value }) => {
      // Get the address in right casing style
      const realAddress = getAddress(address);
      const token = tokensIn[realAddress];
      const parsedAmount = parseFixed(
        value || '0',
        token?.decimals ?? 18
      ).toString();
      return parsedAmount;
    });

    const tokenAddresses: string[] = amountsIn.map(({ address }) => address);
    const signerAddress = await signer.getAddress();
    const wrapLeafTokens = false;
    const slippage = '100'; // 100 bps = 1%
    const poolId = this.pool.value.id;
    const authorisation =
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000001bc90329ed90439744b57601e9ae2d5525e8554ee14d40c84dc8ee89b01de129a35dfb25841fad7f887c025869bbf91496b39200ce19d55fede3f3e74bbe2ea91c';

    this.lastGeneralisedJoinRes = await balancer.pools
      .generalisedJoin(
        poolId,
        tokenAddresses,
        parsedAmountsIn,
        signerAddress,
        wrapLeafTokens,
        slippage,
        authorisation
      )
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });
    console.log({ lastGeneralisedJoinRes: this.lastGeneralisedJoinRes });

    if (!this.lastGeneralisedJoinRes) throw new Error('Not enough liquidity.');

    const bptOut = formatFixed(
      this.lastGeneralisedJoinRes.expectedOut,
      this.pool.value.onchain?.decimals || 18
    );
    const priceImpact: number = bnum(
      formatFixed(
        // @ts-ignore-next-line -- priceImpact is not part of the response type, but it's still part of the response
        this.lastGeneralisedJoinRes.priceImpact,
        this.pool.value.onchain?.decimals || 18
      )
    ).toNumber();

    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');
    return {
      bptOut,
      priceImpact,
    };
  }
}
