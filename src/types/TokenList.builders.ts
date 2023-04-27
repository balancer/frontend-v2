import { wethAddress } from '@tests/unit/builders/address';
import { TokenInfo } from './TokenList';

export function aTokenInfo(...options: Partial<TokenInfo>[]): TokenInfo {
  const defaultTokenInfo = {
    address: wethAddress,
    chainId: 5,
    name: 'test token name',
    symbol: 'TEST',
    decimals: 18,
    logoURI: 'testLogoUri',
  };
  return Object.assign({}, defaultTokenInfo, ...options);
}
