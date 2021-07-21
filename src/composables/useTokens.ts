import {
  TokenRequest,
  TokensProviderPayload,
  TokensProviderSymbol
} from '@/providers/tokens.provider';
import { inject, onBeforeMount } from 'vue';

export default function useTokens(request?: TokenRequest) {
  const { tokens, updateTokenRequest } = inject(
    TokensProviderSymbol
  ) as TokensProviderPayload;

  onBeforeMount(() => {
    if (request) {
      updateTokenRequest(request);
    }
  });

  return {
    tokens
  };
}
