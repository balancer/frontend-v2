import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035', // USDC
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    WETH: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    BAL: '0x120eF59b80774F02211563834d8E3b72cb1649d6',
  },
};

export default tokens;
