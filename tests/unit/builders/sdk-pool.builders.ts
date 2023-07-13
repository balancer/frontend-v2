import { AprBreakdown, Pool } from '@sobal/sdk';

// BAL 80% WETH 20% is the default pool used in builders
export const defaultSdkPool = {
  id: '0x45a0623ab66f985effc1c69d05f1af4badb01b00000200000000001230000060',
  name: '25DAI-25WETH-25USDC-25BAL',
  address: '0x9ee0af1ee0a0782daf5f1af47fd49b2a766bd8d4',
  chainId: 5,
  poolType: 'Weighted',
  poolTypeVersion: 1,
  swapFee: '0.001',
  swapEnabled: true,
  protocolYieldFeeCache: '0.5',
  protocolSwapFeeCache: '0.5',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  factory: '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9',
  symbol: '25DAI-25WETH-25USDC-25BAL',
  tokens: [
    {
      id: '0x45a0623ab66f985effc1c69d05f1af4badb01b00000200000000001230000060-0x8c9e6c40d3402480ace624730524facc5482798c',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      address: '0x8c9e6c40d3402480ace624730524facc5482798c',
      balance: '27.818947583660030622',
      managedBalance: '0',
      weight: '0.25',
      priceRate: '1',
      isExemptFromYieldProtocolFee: false,
      token: {
        pool: null,
        latestUSDPrice: '2.853820562627101823566301950230568',
      },
    },
    {
      id: '0x45a0623ab66f985effc1c69d05f1af4badb01b00000200000000001230000060-0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      address: '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
      balance: '0.237566320113795141',
      managedBalance: '0',
      weight: '0.25',
      priceRate: '1',
      isExemptFromYieldProtocolFee: false,
      token: {
        pool: null,
        latestUSDPrice: '3176.838756437768420043685337770134',
      },
    },
    {
      id: '0x9ee0af1ee0a0782daf5f1af47fd49b2a766bd8d40001000000000000000004b9-0xe0c9275e44ea80ef17579d33c55136b7da269aeb',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0xe0c9275e44ea80ef17579d33c55136b7da269aeb',
      balance: '4.629907',
      managedBalance: '0',
      weight: '0.25',
      priceRate: '1',
      isExemptFromYieldProtocolFee: false,
      token: {
        pool: null,
        latestUSDPrice: '1.000000318944537860858984052644236',
      },
    },
    {
      id: '0x9ee0af1ee0a0782daf5f1af47fd49b2a766bd8d40001000000000000000004b9-0xfa8449189744799ad2ace7e0ebac8bb7575eff47',
      symbol: 'BAL',
      name: 'Balancer Governance Token',
      decimals: 18,
      address: '0xfa8449189744799ad2ace7e0ebac8bb7575eff47',
      balance: '1.313481443776109341',
      managedBalance: '0',
      weight: '0.25',
      priceRate: '1',
      isExemptFromYieldProtocolFee: false,
      token: {
        pool: null,
        latestUSDPrice: '0.7166914931208109728253756585933769',
      },
    },
  ],
  tokensList: [
    '0x8c9e6c40d3402480ace624730524facc5482798c',
    '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
    '0xe0c9275e44ea80ef17579d33c55136b7da269aeb',
    '0xfa8449189744799ad2ace7e0ebac8bb7575eff47',
  ],
  tokenAddresses: [
    '0x8c9e6c40d3402480ace624730524facc5482798c',
    '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
    '0xe0c9275e44ea80ef17579d33c55136b7da269aeb',
    '0xfa8449189744799ad2ace7e0ebac8bb7575eff47',
  ],
  totalLiquidity: '486.271223088014703532',
  totalShares: '10.059467437463080784',
  totalSwapFee: '2.091486399754032142276783432636703',
  totalSwapVolume: '2091.486399754032142276783432636703',
  priceRateProviders: [],
  createTime: 1675949580,
  totalWeight: '1',
  lowerTarget: '0',
  upperTarget: '0',
  isInRecoveryMode: false,
  isPaused: false,
  isNew: false,
  onchain: {
    tokens: {
      '0x8c9e6c40d3402480ace624730524facc5482798c': {
        decimals: 18,
        balance: '27.818947583660030622',
        weight: 0.25,
        symbol: 'DAI',
        name: 'Dai Stablecoin',
      },
      '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1': {
        decimals: 18,
        balance: '0.237566320113795141',
        weight: 0.25,
        symbol: 'WETH',
        name: 'Wrapped Ether',
      },
      '0xe0c9275e44ea80ef17579d33c55136b7da269aeb': {
        decimals: 6,
        balance: '4.629907',
        weight: 0.25,
        symbol: 'USDC',
        name: 'USD Coin',
      },
      '0xfa8449189744799ad2ace7e0ebac8bb7575eff47': {
        decimals: 18,
        balance: '1.313481443776109341',
        weight: 0.25,
        symbol: 'BAL',
        name: 'Balancer Governance Token',
        logoURI:
          'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
      },
    },
    amp: '0',
    swapEnabled: true,
    totalSupply: '10.059467437463080784',
    decimals: 18,
    swapFee: '0.001',
  },
  feesSnapshot: '0',
  volumeSnapshot: '0',
  apr: {
    swapFees: 0,
    tokenAprs: {
      total: 0,
      breakdown: {},
    },
    stakingApr: {
      min: 0,
      max: 0,
    },
    rewardAprs: {
      total: 0,
      breakdown: {},
    },
    protocolApr: 0,
    min: 0,
    max: 0,
  },
};

export function anAprBreakdown(
  ...options: Partial<AprBreakdown>[]
): AprBreakdown {
  const defaultApr = {
    swapFees: 0,
    tokenAprs: {
      total: 0,
      breakdown: {},
    },
    stakingApr: {
      min: 0,
      max: 0,
    },
    rewardAprs: {
      total: 0,
      breakdown: {},
    },
    protocolApr: 0,
    min: 0,
    max: 0,
  };
  return Object.assign(defaultApr, ...options);
}

export function anSdkPool(...options: Partial<Pool>[]): Pool {
  return Object.assign({}, defaultSdkPool, ...options);
}
