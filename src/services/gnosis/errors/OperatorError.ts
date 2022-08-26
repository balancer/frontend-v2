import { AxiosResponse } from 'axios';

import i18n from '@/plugins/i18n';

type ApiActionType = 'get' | 'create' | 'delete';

export interface ApiErrorObject {
  errorType: ApiErrorCodes;
  description: string;
}

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
  SellAmountDoesNotCoverFee = 'SellAmountDoesNotCoverFee',
  PriceExceedsBalance = 'PriceExceedsBalance',
  NoLiquidity = 'NoLiquidity',
  UNHANDLED_GET_ERROR = 'UNHANDLED_GET_ERROR',
  UNHANDLED_CREATE_ERROR = 'UNHANDLED_CREATE_ERROR',
  UNHANDLED_DELETE_ERROR = 'UNHANDLED_DELETE_ERROR',
}

function _mapActionToErrorDetail(action?: ApiActionType) {
  switch (action) {
    case 'get':
      return i18n.global.t('apiErrorCodeDetails.UnhandledGetError');
    case 'create':
      return i18n.global.t('apiErrorCodeDetails.UnhandledCreateError');
    case 'delete':
      return i18n.global.t('apiErrorCodeDetails.UnhandledDeleteError');
    default:
      console.error(
        '[OperatorError::_mapActionToErrorDetails] Uncaught error mapping error action type to server error. Please try again later.'
      );
      return i18n.global.t('apiErrorCodeDetails.UnhandledError');
  }
}

export default class OperatorError extends Error {
  name = 'OperatorError';
  type: ApiErrorCodes;
  description: ApiErrorObject['description'];

  // Status 400 errors
  // https://github.com/cowprotocol/services/blob/6d56663e7b6296597599a5accce746278243606c/crates/orderbook/openapi.yml#L863

  public static getErrorMessage(
    orderPostError: ApiErrorObject,
    action: ApiActionType
  ) {
    try {
      console.log(orderPostError);
      if (orderPostError.errorType) {
        const errorMessage = i18n.global
          .t(`apiErrorCodeDetails.${orderPostError.errorType.toString()}`)
          .replace('apiErrorCodeDetails.', ''); // if a translation cannot be found, keep only the error code

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
    action: ApiActionType
  ) {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response.data, action);

      case 403:
        return action === 'create'
          ? i18n.global.t('apiErrorCodeDetails.error403Accept')
          : i18n.global.t('apiErrorCodeDetails.error403Cancel');

      case 429:
        return action === 'create'
          ? i18n.global.t('apiErrorCodeDetails.error429Accept')
          : i18n.global.t('apiErrorCodeDetails.error429Cancel');

      case 500:
      default:
        console.error(
          `[OperatorError::getErrorFromStatusCode] Error ${
            action === 'create' ? 'creating' : 'cancelling'
          } the order, status code:`,
          response.status || 'unknown'
        );
        return i18n.global.t('apiErrorCodeDetails.Error500', [
          action === 'create'
            ? i18n.global.t('creating').toLocaleLowerCase()
            : i18n.global.t('cancelling').toLocaleLowerCase(),
        ]);
    }
  }
  constructor(apiError: ApiErrorObject) {
    super(apiError.description);

    this.type = apiError.errorType;
    this.description = apiError.description;
    this.message = i18n.global.t(`apiErrorCodeDetails.${apiError.errorType}`);
  }
}

export function isValidOperatorError(error: any): error is OperatorError {
  return error instanceof OperatorError;
}
