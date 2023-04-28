import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0x0000000000000000000000000000000000001010',
    output: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  Addresses: {
    nativeAsset: '0x0000000000000000000000000000000000001010',
    wNativeAsset: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    BAL: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
  },
};

export default tokens;
