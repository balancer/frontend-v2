import { OrderKind } from '@cowprotocol/contracts';
import {
  APIError,
  NetworkID,
  OptimalRatesWithPartnerFees,
  ParaSwap,
  SwapSide,
} from 'paraswap';
import { RateOptions } from 'paraswap/build/types';

import { networkId } from '@/composables/useNetwork';

import { PriceInformation, PriceQuoteParams } from './types';
import { toErc20Address } from './utils';

type ParaSwapPriceQuote = OptimalRatesWithPartnerFees;
const API_URL = 'https://apiv4.paraswap.io/v2';

export default class ParaSwapService {
  paraSwap: ParaSwap;

  constructor() {
    this.paraSwap = new ParaSwap(networkId.value as NetworkID, API_URL);
  }

  public async getPriceQuote(params: PriceQuoteParams) {
    try {
      const { amount, sellToken, buyToken, kind, fromDecimals, toDecimals } =
        params;

      const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL;

      // https://developers.paraswap.network/api/get-rate-for-a-token-pair
      const options: RateOptions | undefined = {
        maxImpact: 100,
        excludeDEXS: 'ParaSwapPool4',
      };

      const rateResult = await this.paraSwap.getRate(
        toErc20Address(sellToken),
        toErc20Address(buyToken),
        amount,
        swapSide,
        options,
        fromDecimals,
        toDecimals
      );

      if (this.isGetRateSuccess(rateResult)) {
        // Success getting the price
        return this.toPriceInformation(rateResult);
      } else {
        // Error getting the price
        const priceQuote = this.getPriceQuoteFromError(rateResult);
        if (priceQuote) {
          return this.toPriceInformation(priceQuote);
        }
      }
    } catch (e) {
      console.log(`[Paraswap]: Failed to get price from API`, e);
    }

    return null;
  }

  private toPriceInformation(
    priceRaw: ParaSwapPriceQuote | null
  ): PriceInformation | null {
    if (!priceRaw || !priceRaw.details) {
      return null;
    }

    const { destAmount, srcAmount, details, side } = priceRaw;
    if (side === SwapSide.SELL) {
      return {
        amount: destAmount,
        token: details.tokenTo,
      };
    } else {
      return {
        amount: srcAmount,
        token: details.tokenFrom,
      };
    }
  }

  private isGetRateSuccess(
    rateResult: OptimalRatesWithPartnerFees | APIError
  ): rateResult is OptimalRatesWithPartnerFees {
    return !!(rateResult as OptimalRatesWithPartnerFees).destAmount;
  }

  private getPriceQuoteFromError(error: APIError): ParaSwapPriceQuote | null {
    if (
      error.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT' &&
      error.data &&
      error.data.priceRoute
    ) {
      // If the price impact is too big, it still give you the estimation
      return error.data.priceRoute;
    } else {
      return null;
    }
  }
}

export const paraSwapService = new ParaSwapService();
