import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    BAL: '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',
    rETH: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
    wstETH: '0x5979d7b546e38e414f7e9822514be443a4800529',
  },
};

export default tokens;
