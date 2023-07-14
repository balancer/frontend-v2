import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['wNEON', 'wSOL', 'USDC', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xEA6B04272f9f62F997F666F07D3a974134f7FFb9', // USDC
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x202C35e517Fa803B537565c40F0a6965D7204609', // wNEON
    WETH: '0xcFFd84d468220c11be64dc9dF64eaFE02AF60e8A', // WETH (WORMHOLE)
    BAL: '0x0000000000000000000000000000000000000000',
  },
};

export default tokens;
