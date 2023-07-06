import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'USDT', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xb19382073c7A0aDdbb56Ac6AF1808Fa49e377B75',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    BAL: '0xb19382073c7A0aDdbb56Ac6AF1808Fa49e377B75',
    bbaUSD: '',
    bbaUSDv2: '',
    rETH: '',
    stMATIC: '',
    stETH: '',
    wstETH: '',
  },
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from sepolia to mainnet, e.g
     * [sepolia address]: mainnet address
     */
    '0x7b79995e5f793a07bc00c21412e50ecae098e7f9':
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xb19382073c7a0addbb56ac6af1808fa49e377b75':
      '0xba100000625a3754423978a60c9317c58a424e3d',
  },
};

export default tokens;
