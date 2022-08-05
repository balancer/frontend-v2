import { inject } from 'vue';

import {
  TokenListsProviderResponse,
  TokenListsProviderSymbol,
} from '@/providers/token-lists.provider';

const defaultProviderResponse = {} as TokenListsProviderResponse;

export default function useTokenLists(): TokenListsProviderResponse {
  return inject(TokenListsProviderSymbol, defaultProviderResponse);
}
