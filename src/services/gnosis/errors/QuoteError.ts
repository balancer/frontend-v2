import { ApiErrorCodes, ApiErrorObject } from './OperatorError';

export interface GpQuoteErrorObject {
  errorType: GpQuoteErrorCodes;
  description: string;
}

// Conforms to backend API
// https://github.com/gnosis/gp-v2-services/blob/0bd5f7743bebaa5acd3be13e35ede2326a096f14/orderbook/openapi.yml#L562
export enum GpQuoteErrorCodes {
  UnsupportedToken = 'UnsupportedToken',
  InsufficientLiquidity = 'InsufficientLiquidity',
  FeeExceedsFrom = 'FeeExceedsFrom',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR'
}

export enum GpQuoteErrorDetails {
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  InsufficientLiquidity = 'Token pair selected has insufficient liquidity',
  FeeExceedsFrom = 'Current fee exceeds entered "from" amount',
  UNHANDLED_ERROR = 'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
}

export function mapOperatorErrorToQuoteError(
  error?: ApiErrorObject
): GpQuoteErrorObject {
  switch (error?.errorType) {
    case ApiErrorCodes.NotFound:
      return {
        errorType: GpQuoteErrorCodes.InsufficientLiquidity,
        description: GpQuoteErrorDetails.InsufficientLiquidity
      };
    case ApiErrorCodes.UnsupportedToken:
      return {
        errorType: GpQuoteErrorCodes.UnsupportedToken,
        description: error.description
      };
    default:
      return {
        errorType: GpQuoteErrorCodes.UNHANDLED_ERROR,
        description: GpQuoteErrorDetails.UNHANDLED_ERROR
      };
  }
}

export default class GpQuoteError extends Error {
  name = 'QuoteErrorObject';
  type: GpQuoteErrorCodes;
  description: string;

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static quoteErrorDetails = GpQuoteErrorDetails;

  public static async getErrorMessage(response: Response) {
    try {
      const orderPostError: GpQuoteErrorObject = await response.json();

      if (orderPostError.errorType) {
        const errorMessage =
          GpQuoteError.quoteErrorDetails[orderPostError.errorType];
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType;
      } else {
        console.error('Unknown reason for bad quote fetch', orderPostError);
        return orderPostError.description;
      }
    } catch (error) {
      console.error(
        'Error handling 400/404 error. Likely a problem deserialising the JSON response'
      );
      return GpQuoteError.quoteErrorDetails.UNHANDLED_ERROR;
    }
  }

  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response);

      case 500:
      default:
        console.error(
          '[QuoteError::getErrorFromStatusCode] Error fetching quote, status code:',
          response.status || 'unknown'
        );
        return 'Error fetching quote';
    }
  }
  constructor(quoteError: GpQuoteErrorObject) {
    super(quoteError.description);

    this.type = quoteError.errorType;
    this.description = quoteError.description;
    this.message = GpQuoteError.quoteErrorDetails[quoteError.errorType];
  }
}

export function isValidQuoteError(error: any): error is GpQuoteError {
  return error instanceof GpQuoteError;
}
