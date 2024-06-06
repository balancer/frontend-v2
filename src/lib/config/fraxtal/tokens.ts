import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['USDT', 'DAI', 'USDC', 'BAL', 'wfrxETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xfc00000000000000000000000000000000000006',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xfc00000000000000000000000000000000000006',
    WETH: '',
    BAL: '',
  },
};

export default tokens;
