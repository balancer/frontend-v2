import { inject } from 'vue';

import {
  TokensProviderResponse,
  TokensProviderSymbol,
} from '@/providers/tokens.provider';

const defaultProviderResponse = {} as TokensProviderResponse;

/**
 * useTokens Composable
 * Interface to all token static and dynamic metatdata.
 */
export default function useTokens(): TokensProviderResponse {
  return inject(TokensProviderSymbol, defaultProviderResponse);
}
