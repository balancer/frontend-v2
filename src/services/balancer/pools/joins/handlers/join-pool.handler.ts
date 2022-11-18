import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Ref } from 'vue';

export type JoinParams = {
  amountsIn: AmountIn[];
  tokensIn: TokenInfoMap;
  prices: TokenPrices;
  signer: JsonRpcSigner;
  slippageBsp: number;
  relayerSignature?: string;
};

export type QueryOutput = {
  bptOut: string;
  priceImpact: number;
};

export abstract class JoinPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  abstract join(params: JoinParams): Promise<TransactionResponse>;

  abstract queryJoin(params: JoinParams): Promise<QueryOutput>;
}
