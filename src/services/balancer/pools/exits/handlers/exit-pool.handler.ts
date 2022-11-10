import { AmountOut } from '@/providers/local/exit-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Ref } from 'vue';

export type ExitParams = {
  bptIn: string;
  amountsOut: AmountOut[];
  tokenInfo: TokenInfoMap;
  prices: TokenPrices;
  signer: Signer;
  slippageBsp: number;
  relayerSignature?: string;
};

export type QueryOutput = {
  priceImpact: number;
  amountsOut: Record<string, string>;
};

export abstract class ExitPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  abstract exit(params: ExitParams): Promise<TransactionResponse>;

  abstract queryExit(params: ExitParams): Promise<QueryOutput>;

  abstract getSingleAssetMax(params: ExitParams): Promise<string>;
}
