import { parseUnits } from '@ethersproject/units';
import axios from 'axios';

import { OPERATOR_URL } from './constants';
import OperatorError from './error';
import { getSigningSchemeApiValue, OrderCreation } from './signatures';
import {
  FeeInformation,
  FeeQuoteParams,
  OrderID,
  OrderMetaData,
  PriceQuoteParams
} from './types';
import { getMarket, normalizeTokenAddress } from './utils';

export default class GnosisOperatorService {
  baseURL: string;

  constructor(apiVersion = 'v1') {
    this.baseURL = `${OPERATOR_URL}/${apiVersion}`;
  }

  public async postSignedOrder(params: {
    order: OrderCreation;
    owner: string;
  }) {
    const { order, owner } = params;

    console.log('[Gnosis Operator] Post signed order for network', order);

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

    if (response.status === 200) {
      return response.data as OrderID;
    }

    const errorMessage = OperatorError.getErrorForUnsuccessfulPostOrder(
      response
    );

    throw new Error(errorMessage);
  }

  public async getOrder(orderId: OrderID) {
    try {
      console.log('[Gnosis Operator] Get order for ', orderId);

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
      console.log('[Gnosis Operator] Get fee from API', params);

      const { kind } = params;

      const amount = parseUnits(params.amount).toString();
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
      console.log('[Gnosis Operator] Get price from API', params);

      const { sellToken, buyToken, kind } = params;

      const amount = parseUnits(params.amount).toString();
      const market = getMarket(sellToken, buyToken, kind);

      const response = await axios.get<FeeInformation>(
        `${this.baseURL}/markets/${market}/${kind}/${amount}`
      );
      return response.data;
    } catch (e) {
      console.log(`[Gnosis Operator]: Failed to get price from API`, e);
    }

    return null;
  }
}
