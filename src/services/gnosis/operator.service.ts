import axios from 'axios';

import { OPERATOR_URL } from './constants';
import OperatorError from './error';
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
import { getMarket, normalizeTokenAddress } from './utils';

export default class GnosisOperatorService {
  baseURL: string;

  constructor(apiVersion = 'v1') {
    this.baseURL = `${OPERATOR_URL}/${apiVersion}`;
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
      console.log(`[Gnosis Operator]: Failed to get order ${orderId}`, e);
    }

    return null;
  }

  public async getFeeQuote(params: FeeQuoteParams) {
    try {
      const { amount, kind } = params;

      const sellToken = normalizeTokenAddress(params.sellToken);
      const buyToken = normalizeTokenAddress(params.buyToken);

      const response = await axios.get<FeeInformation>(
        `${this.baseURL}/fee?sellToken=${sellToken}&buyToken=${buyToken}&amount=${amount}&kind=${kind}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Operator]: Failed to get fee from API`, e);
    }

    return null;
  }

  public async getPriceQuote(params: PriceQuoteParams) {
    try {
      const { amount, sellToken, buyToken, kind } = params;

      const market = getMarket(sellToken, buyToken, kind);

      const response = await axios.get<PriceInformation>(
        `${this.baseURL}/markets/${market}/${kind}/${amount}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Operator]: Failed to get price from API`, e);
    }

    return null;
  }
}

export const gnosisOperator = new GnosisOperatorService();
