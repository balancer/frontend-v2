import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    BAL: '0xba100000625a3754423978a60c9317c58a424e3d',
    bbaUSD: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
    bbaUSDv2: '0xA13a9247ea42D743238089903570127DdA72fE44',
    rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    wstETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  },
  DisableInternalBalanceWithdrawals: [
    '0xEb91861f8A4e1C12333F42DCE8fB0Ecdc28dA716',
    '0x4d19F33948b99800B6113Ff3e83beC9b537C85d2',
    '0xe025E3ca2bE02316033184551D4d3Aa22024D9DC',
  ],
  /**
   * The approval function for these tokens doesn't allow setting a new approval
   * level if the current level is > 0. Thus they must be approved in two steps
   * first setting to 0 then setting to the required amount.
   */
  DoubleApprovalRequired: [
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c', // ENJ
  ],
};

export default tokens;
