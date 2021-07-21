import { inject } from 'vue';
import {
  TokenStoreProviderPayload,
  TokenStoreProviderSymbol
} from '@/providers/tokenstore.provider';

export type TokenListItem = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  balance: string;
};

type TokenList = {
  keywords: string[];
  logoURI: string;
  name: string;
  timestamp: string;
  tokens: TokenListItem[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokenListsURL: string;
};

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR

// This composable retrieves all the tokens from active token lists,
// all the injected tokens from the store and the ETHER token
// for other composables to build upon
export default function useTokenStore() {
  const {
    isLoading,
    lists,
    allTokens,
    listMap,
    activeTokenLists,
    refreshTokenLists,
    toggleActiveTokenList,
    isActiveList
  } = inject(TokenStoreProviderSymbol) as TokenStoreProviderPayload;

  return {
    isLoading,
    lists,
    allTokens,
    listMap,
    activeTokenLists,
    refreshTokenLists,
    toggleActiveTokenList,
    isActiveList
  };
}
