import { isProductionMode } from '@/plugins/modes';

/**
 * Throws error from vue-queries, where thrown errors are normally "silenced" because they just cause a query retry.
 *
 * This helper explicitly console.logs the thrown error, which is useful when testing and debugging
 */
export function throwQueryError(errorMessage: string, error: unknown) {
  if (!isProductionMode()) console.trace(errorMessage, error);
  throw Error(errorMessage, { cause: error });
}
