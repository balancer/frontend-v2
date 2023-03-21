import { wethAddress } from '@tests/unit/builders/address';
import { TokenInfo } from './TokenList';

export const aTokenInfo = (tokenAddress = wethAddress): TokenInfo => ({
  address: tokenAddress,
  chainId: 5,
  name: 'test token name',
  symbol: 'TEST',
  decimals: 18,
  logoURI: 'testLogoUri',
});
