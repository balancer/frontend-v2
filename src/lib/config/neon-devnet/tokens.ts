import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['ETH', 'wNEON', 'wSOL', 'USDC', 'AAVE'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0x512E48836Cd42F3eB6f50CEd9ffD81E0a7F15103', // USDC
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x11adC2d986E334137b9ad0a0F290771F31e9517F', // WNEON
    WETH: '0x46E986B5b0f87F1026ff52Ce20340467199F891D', // WETH (SOLLET)
    BAL: '0x0000000000000000000000000000000000000000',
  },
};

export default tokens;
