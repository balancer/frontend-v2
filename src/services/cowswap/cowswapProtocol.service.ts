import { Network } from '@balancer-labs/sdk';
import axios from 'axios';

import { networkId } from '@/composables/useNetwork';

import OperatorError from './errors/OperatorError';
import {
  getSigningSchemeApiValue,
  OrderCancellation,
  OrderCreation,
} from './signing';
import {
  OrderID,
  OrderMetaData,
  CowSwapQuoteResponse,
  PriceQuoteParams,
} from './types';

export const API_URLS = {
  [Network.MAINNET]: 'https://api.cow.fi/mainnet/api',
};

export default class CowswapProtocolService {
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

    const response = await axios.post<OrderID>(
      `${this.baseURL}/orders`,
      {
        ...order,
        signingScheme: getSigningSchemeApiValue(order.signingScheme),
        from: owner,
      },
      {
        validateStatus: () => true,
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
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

    const response = await axios.delete<OrderID>(
      `${this.baseURL}/orders/${cancellation.orderUid}`,
      {
        data: {
          signature: cancellation.signature,
          signingScheme: getSigningSchemeApiValue(cancellation.signingScheme),
          from: owner,
        },
        validateStatus: () => true,
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    const errorMessage = OperatorError.getErrorFromStatusCode(
      response,
      'delete'
    );

    throw new Error(errorMessage);
  }

  public async getOrder(orderId: OrderID) {
    try {
      const { data } = await axios.get<OrderMetaData>(
        `${this.baseURL}/orders/${orderId}`
      );

      return data;
    } catch (e) {
      console.log(`[CoWswap Protocol]: Failed to get order ${orderId}`, e);
    }

    return null;
  }

  public async getPriceQuote(params: PriceQuoteParams) {
    try {
      const response = await axios.post<CowSwapQuoteResponse>(
        `${this.baseURL}/quote`,
        params
      );

      return response.data.quote;
    } catch (e) {
      console.log(`[CoWswap Protocol]: Failed to get price from API`, e);
    }

    return null;
  }
}

export const cowswapProtocolService = new CowswapProtocolService();
