import { Network } from '@balancer-labs/sdk';
import { OrderKind } from '@cowprotocol/contracts';
import axios from 'axios';

import { networkId } from '@/composables/useNetwork';

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from './constants';
import { PriceInformation, PriceQuoteParams } from './types';
import { toErc20Address } from './utils';

// copy/pasting as the library types correspond to the internal types, not API response
// e.g "price: BigNumber" when we want the API response type: "price: string"
// see link below to see
// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface GetSwapQuoteResponseLiquiditySource {
  name: string;
  proportion: string;
  intermediateToken?: string;
  hops?: string[];
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface MatchaBaseQuote {
  chainId: Network;
  price: string;
  buyAmount: string;
  sellAmount: string;
  sources: GetSwapQuoteResponseLiquiditySource[];
  gasPrice: string;
  estimatedGas: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  protocolFee: string;
  minimumProtocolFee: string;
  allowanceTarget?: string;
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
export interface MatchaPriceQuote extends MatchaBaseQuote {
  sellTokenAddress: string;
  buyTokenAddress: string;
  value: string;
  gas: string;
}

export const API_URLS = {
  [Network.MAINNET]: 'https://api.0x.org/swap',
  [Network.ROPSTEN]: 'https://ropsten.api.0x.org/swap',
};

// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = GP_SETTLEMENT_CONTRACT_ADDRESS;
const EXCLUDED_SOURCES = 'Mooniswap'; // getting incorrect quotes for DAI/USDT
const MATCHA_DEFAULT_OPTIONS = `affiliateAddress=${AFFILIATE_ADDRESS}&excludedSources=${EXCLUDED_SOURCES}`;

export default class Match0xService {
  baseURL: string;

  constructor(apiVersion = 'v1') {
    const baseURL = API_URLS[networkId.value] ?? API_URLS[Network.MAINNET];

    this.baseURL = `${baseURL}/${apiVersion}`;
  }

  public async getPriceQuote(params: PriceQuoteParams) {
    try {
      const { amount, sellToken, buyToken, kind } = params;

      const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount';

      const response = await axios.get<MatchaPriceQuote | null>(
        `${this.baseURL}/price?sellToken=${toErc20Address(
          sellToken
        )}&buyToken=${toErc20Address(
          buyToken
        )}&${swapSide}=${amount}&${MATCHA_DEFAULT_OPTIONS}`
      );
      return this.toPriceInformation(response.data, kind);
    } catch (e) {
      console.log(`[Matcha 0x]: Failed to get price from API`, e);
    }

    return null;
  }

  private toPriceInformation(
    priceRaw: MatchaPriceQuote | null,
    kind: OrderKind
  ): PriceInformation | null {
    if (!priceRaw || !priceRaw.price) {
      return null;
    }

    const { sellAmount, buyAmount, sellTokenAddress, buyTokenAddress } =
      priceRaw;

    if (kind === OrderKind.BUY) {
      return { amount: sellAmount, token: sellTokenAddress };
    } else {
      return { amount: buyAmount, token: buyTokenAddress };
    }
  }
}

export const match0xService = new Match0xService();
