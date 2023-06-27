import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'USDT', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '',
    WETH: '',
    BAL: '',
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
  },
};

export default tokens;
