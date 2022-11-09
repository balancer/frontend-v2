import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';
import { Address, BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Ref } from 'vue';

export type TokensOut = Record<Address, string>;

export type ExitParams = {
  amount: string;
  tokenInfo: TokenInfo;
  prices: TokenPrices;
  signer: Signer;
  slippageBsp: number;
  relayerSignature?: string;
};

export type QueryOutput = {
  priceImpact: number;
  tokensOut: TokensOut;
};

export abstract class ExitPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  abstract exit(params: ExitParams): Promise<TransactionResponse>;

  abstract queryExit(params: ExitParams): Promise<QueryOutput>;
}
