import { AmountIn } from '@/providers/local/join-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionRequest } from '@ethersproject/abstract-provider';

export type QueryOutput = {
  bptOut: string;
  priceImpact: number;
};

export abstract class JoinPoolHandler {
  constructor(
    public readonly pool: Pool,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  abstract buildJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<TransactionRequest>;

  abstract queryJoin(
    amountsIn: AmountIn[],
    tokensIn: TokenInfoMap,
    prices: TokenPrices
  ): Promise<QueryOutput>;
}
