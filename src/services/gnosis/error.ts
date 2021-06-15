// Conforms to backend API

import { AxiosResponse } from 'axios';

// https://github.com/gnosis/gp-v2-services/blob/0bd5f7743bebaa5acd3be13e35ede2326a096f14/orderbook/openapi.yml#L562
export enum ApiErrorCodes {
  DuplicateOrder = 'DuplicateOrder',
  InvalidSignature = 'InvalidSignature',
  MissingOrderData = 'MissingOrderData',
  InsufficientValidTo = 'InsufficientValidTo',
  InsufficientFunds = 'InsufficientFunds',
  InsufficientFee = 'InsufficientFee',
  UnsupportedToken = 'UnsupportedToken',
  WrongOwner = 'WrongOwner'
}

export interface ApiError {
  errorType: ApiErrorCodes;
  description: string;
}

const API_ERROR_CODE_DESCRIPTIONS = {
  [ApiErrorCodes.DuplicateOrder]:
    'There was another identical order already submitted. Please try again.',
  [ApiErrorCodes.InsufficientFee]:
    "The signed fee is insufficient. It's possible that is higher now due to a change in the gas price, ether price, or the sell token price. Please try again to get an updated fee quote.",
  [ApiErrorCodes.InvalidSignature]:
    'The order signature is invalid. Check whether your Wallet app supports off-chain signing.',
  [ApiErrorCodes.MissingOrderData]: 'The order has missing information',
  [ApiErrorCodes.InsufficientValidTo]:
    'The order you are signing is already expired. This can happen if you set a short expiration in the settings and waited too long before signing the transaction. Please try again.',
  [ApiErrorCodes.InsufficientFunds]: "The account doesn't have enough funds",
  [ApiErrorCodes.UnsupportedToken]:
    'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  [ApiErrorCodes.WrongOwner]:
    "The signature is invalid.\n\nIt's likely that the signing method provided by your wallet doesn't comply with the standards required by CowSwap.\n\nCheck whether your Wallet app supports off-chain signing (EIP-712 or ETHSIGN).",
  UNHANDLED_ERROR: 'The order was not accepted by the network'
};

export default class OperatorError extends Error {
  name = 'OperatorError';
  type: ApiErrorCodes;
  description: ApiError['description'];

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static apiErrorDetails = API_ERROR_CODE_DESCRIPTIONS;

  static getErrorMessage(response: AxiosResponse) {
    try {
      const orderPostError: ApiError = response.data;

      if (orderPostError.errorType) {
        return OperatorError.apiErrorDetails[orderPostError.errorType];
      } else {
        console.error(
          'Unknown reason for bad order submission',
          orderPostError
        );
        return orderPostError.description;
      }
    } catch (error) {
      console.error(
        'Error handling a 400 error. Likely a problem deserialising the JSON response'
      );
      return OperatorError.apiErrorDetails.UNHANDLED_ERROR;
    }
  }
  static getErrorForUnsuccessfulPostOrder(response: AxiosResponse) {
    switch (response.status) {
      case 400:
        return this.getErrorMessage(response);

      case 403:
        return 'The order cannot be accepted. Your account is deny-listed.';

      case 429:
        return 'The order cannot be accepted. Too many order placements. Please, retry in a minute';

      case 500:
      default:
        return 'Error adding an order';
    }
  }
  constructor(apiError: ApiError) {
    super(apiError.description);

    this.type = apiError.errorType;
    this.description = apiError.description;
    this.message = OperatorError.apiErrorDetails[apiError.errorType];
  }
}
