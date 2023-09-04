import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'WETH', 'DAI', 'USDC', 'BAL', 'AVAX'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    BAL: '0xE15bCB9E0EA69e6aB9FA080c4c4A5632896298C3',
  },
};

export default tokens;
