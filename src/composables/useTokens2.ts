import { inject } from 'vue';
import {
  TokensProviderResponse,
  TokensProviderSymbol
} from '@/providers/tokens2.provider';

const defaultProviderResponse = {} as TokensProviderResponse;

/**
 * useTokens Composable
 * Interface to all token static and dynamic metatdata.
 */
export default function useTokens2(): TokensProviderResponse {
  return inject(TokensProviderSymbol, defaultProviderResponse);
}
