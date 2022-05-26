import TokenlistMap from './tokenlist_map.json';

export interface TokenListMap {
  Balancer: {
    Default: string;
    Vetted: string;
  };
  External: string[];
}

interface TokenListMapByNetwork {
  [networkKey: string]: TokenListMap;
}

/**
 * Mapping of the TokenLists used on each network
 */
export const TOKEN_LIST_MAP: TokenListMapByNetwork = TokenlistMap;
