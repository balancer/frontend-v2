import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x4200000000000000000000000000000000000006',
    WETH: '0x4200000000000000000000000000000000000006',
    BAL: '0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921',
  },
};

export default tokens;
