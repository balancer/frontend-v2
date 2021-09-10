import { AxiosResponse } from 'axios';

type ApiActionType = 'get' | 'create' | 'delete';

export interface ApiErrorObject {
  errorType: ApiErrorCodes;
  description: string;
}

// Conforms to backend API
// https://github.com/gnosis/gp-v2-services/blob/0bd5f7743bebaa5acd3be13e35ede2326a096f14/orderbook/openapi.yml#L562
export enum ApiErrorCodes {
  DuplicateOrder = 'DuplicateOrder',
  InvalidSignature = 'InvalidSignature',
  MissingOrderData = 'MissingOrderData',
  InsufficientValidTo = 'InsufficientValidTo',
  InsufficientFunds = 'InsufficientFunds',
  InsufficientFee = 'InsufficientFee',
  UnsupportedToken = 'UnsupportedToken',
  WrongOwner = 'WrongOwner',
  NotFound = 'NotFound',
  OrderNotFound = 'OrderNotFound',
  AlreadyCancelled = 'AlreadyCancelled',
  OrderFullyExecuted = 'OrderFullyExecuted',
  OrderExpired = 'OrderExpired',
  UnsupportedSellTokenSource = 'UnsupportedSellTokenSource',
  UnsupportedBuyTokenSource = 'UnsupportedBuyTokenSource',
  UNHANDLED_GET_ERROR = 'UNHANDLED_GET_ERROR',
  UNHANDLED_CREATE_ERROR = 'UNHANDLED_CREATE_ERROR',
  UNHANDLED_DELETE_ERROR = 'UNHANDLED_DELETE_ERROR'
}

export enum ApiErrorCodeDetails {
  DuplicateOrder = 'There was another identical order already submitted. Please try again.',
  InsufficientFee = "The signed fee is insufficient. It's possible that is higher now due to a change in the gas price, ether price, or the sell token price. Please try again to get an updated fee quote.",
  InvalidSignature = 'The order signature is invalid. Check whether your Wallet app supports off-chain signing.',
  MissingOrderData = 'The order has missing information.',
  InsufficientValidTo = 'The order you are signing is already expired. This can happen if you set a short expiration in the settings and waited too long before signing the transaction. Please try again.',
  InsufficientFunds = "The account doesn't have enough funds.",
  UnsupportedToken = 'One of the tokens you are trading is unsupported.',
  WrongOwner = "The signature is invalid.\n\nIt's likely that the signing method provided by your wallet doesn't comply with the standards required by Balancer.\n\nCheck whether your Wallet app supports off-chain signing (EIP-712 or ETHSIGN).",
  NotFound = 'Token pair selected has insufficient liquidity.',
  OrderNotFound = 'The order you are trying to cancel does not exist.',
  AlreadyCancelled = 'Order is already cancelled.',
  OrderFullyExecuted = 'Order is already filled.',
  OrderExpired = 'Order is expired.',
  UnsupportedSellTokenSource = 'The sell token source is currently not supported.',
  UnsupportedBuyTokenSource = 'The buy token source is currently not supported.',
  UNHANDLED_GET_ERROR = 'Order fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
  UNHANDLED_CREATE_ERROR = 'The order was not accepted by the network.',
  UNHANDLED_DELETE_ERROR = 'The order cancellation was not accepted by the network.'
}

function _mapActionToErrorDetail(action?: ApiActionType) {
  switch (action) {
    case 'get':
      return ApiErrorCodeDetails.UNHANDLED_GET_ERROR;
    case 'create':
      return ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR;
    case 'delete':
      return ApiErrorCodeDetails.UNHANDLED_DELETE_ERROR;
    default:
      console.error(
        '[OperatorError::_mapActionToErrorDetails] Uncaught error mapping error action type to server error. Please try again later.'
      );
      return 'Something failed. Please try again later.';
  }
}

export default class OperatorError extends Error {
  name = 'OperatorError';
  type: ApiErrorCodes;
  description: ApiErrorObject['description'];

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static apiErrorDetails = ApiErrorCodeDetails;

  public static getErrorMessage(
    orderPostError: ApiErrorObject,
    action: ApiActionType
  ) {
    try {
      console.log(orderPostError);
      if (orderPostError.errorType) {
        const errorMessage =
          OperatorError.apiErrorDetails[orderPostError.errorType];
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType;
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
      return _mapActionToErrorDetail(action);
    }
  }
  static getErrorFromStatusCode(
    response: AxiosResponse,
    action: 'create' | 'delete'
  ) {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response.data, action);

      case 403:
        return `The order cannot be ${
          action === 'create' ? 'accepted' : 'cancelled'
        }. Your account is deny-listed.`;

      case 429:
        return `The order cannot be ${
          action === 'create'
            ? 'accepted. Too many order placements'
            : 'cancelled. Too many order cancellations'
        }. Please, retry in a minute`;

      case 500:
      default:
        console.error(
          `[OperatorError::getErrorFromStatusCode] Error ${
            action === 'create' ? 'creating' : 'cancelling'
          } the order, status code:`,
          response.status || 'unknown'
        );
        return `Error ${
          action === 'create' ? 'creating' : 'cancelling'
        } the order`;
    }
  }
  constructor(apiError: ApiErrorObject) {
    super(apiError.description);

    this.type = apiError.errorType;
    this.description = apiError.description;
    this.message = ApiErrorCodeDetails[apiError.errorType];
  }
}

export function isValidOperatorError(error: any): error is OperatorError {
  return error instanceof OperatorError;
}
