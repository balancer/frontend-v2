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
    wstETH: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
    rETH: '0x0266F4F08D82372CF0FcbCCc0Ff74309089c74d1',
    stMATIC: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
  },
};

export default tokens;
