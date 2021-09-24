import axios from 'axios';

import { Network, networkId } from '@/composables/useNetwork';

import { IS_DEV } from '@/constants/env';

import OperatorError from './errors/OperatorError';
import {
  getSigningSchemeApiValue,
  OrderCreation,
  OrderCancellation
} from './signing';
import {
  FeeInformation,
  FeeQuoteParams,
  OrderID,
  OrderMetaData,
  PriceInformation,
  PriceQuoteParams
} from './types';
import { getCanonicalMarket, toErc20Address } from './utils';

export const API_URLS = {
  [Network.MAINNET]: IS_DEV
    ? 'https://protocol-mainnet.dev.gnosisdev.com/api'
    : 'https://protocol-mainnet.gnosis.io/api',
  [Network.RINKEBY]: IS_DEV
    ? 'https://protocol-rinkeby.dev.gnosisdev.com/api'
    : 'https://protocol-rinkeby.gnosis.io/api'
};

export default class GnosisProtocolService {
  baseURL: string;

  constructor(apiVersion = 'v1') {
    const baseURL = API_URLS[networkId.value] ?? API_URLS[Network.MAINNET];

    this.baseURL = `${baseURL}/${apiVersion}`;
  }

  public async sendSignedOrder(params: {
    order: OrderCreation;
    owner: string;
  }) {
    const { order, owner } = params;

    // Call API
    const response = await axios.post<OrderID>(
      `${this.baseURL}/orders`,
      {
        ...order,
        signingScheme: getSigningSchemeApiValue(order.signingScheme),
        from: owner
      },
      {
        validateStatus: () => true
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data as OrderID;
    }

    const errorMessage = OperatorError.getErrorFromStatusCode(
      response,
      'create'
    );

    throw new Error(errorMessage);
  }

  public async sendSignedOrderCancellation(params: {
    cancellation: OrderCancellation;
    owner: string;
  }) {
    const { cancellation, owner } = params;

    // Call API
    const response = await axios.delete<OrderID>(
      `${this.baseURL}/orders/${cancellation.orderUid}`,
      {
        data: {
          signature: cancellation.signature,
          signingScheme: getSigningSchemeApiValue(cancellation.signingScheme),
          from: owner
        },
        validateStatus: () => true
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data as OrderID;
    }

    const errorMessage = OperatorError.getErrorFromStatusCode(
      response,
      'delete'
    );

    throw new Error(errorMessage);
  }

  public async getOrder(orderId: OrderID) {
    try {
      const response = await axios.get<OrderMetaData>(
        `${this.baseURL}/orders/${orderId}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Protocol]: Failed to get order ${orderId}`, e);
    }

    return null;
  }

  public async getFeeQuote(params: FeeQuoteParams) {
    try {
      const { amount, kind } = params;

      const sellToken = toErc20Address(params.sellToken);
      const buyToken = toErc20Address(params.buyToken);

      const response = await axios.get<FeeInformation>(
        `${this.baseURL}/fee?sellToken=${sellToken}&buyToken=${buyToken}&amount=${amount}&kind=${kind}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Protocol]: Failed to get fee from API`, e);
    }

    return null;
  }

  public async getPriceQuote(params: PriceQuoteParams) {
    try {
      const { amount, sellToken, buyToken, kind } = params;

      const { baseToken, quoteToken } = getCanonicalMarket({
        sellToken,
        buyToken,
        kind
      });
      const market = `${toErc20Address(baseToken)}-${toErc20Address(
        quoteToken
      )}`;

      const response = await axios.get<PriceInformation>(
        `${this.baseURL}/markets/${market}/${kind}/${amount}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Protocol]: Failed to get price from API`, e);
    }

    return null;
  }
}

export const gnosisProtocolService = new GnosisProtocolService();
