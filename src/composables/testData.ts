export const testPool = {
  id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
  address: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42',
  poolType: 'Stable',
  swapFee: '0.00005',
  tokensList: [
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
  ],
  totalLiquidity: '7607916.813806737404790840081133',
  totalSwapVolume: '10313583529.122751850142499234',
  totalSwapFee: '790443.4753835582900430453073',
  totalShares: '7533503.744048508708028943',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  factory: '0xc66ba2b6595d3613ccab350c886ace23866ede24',
  amp: '1390',
  createTime: 1625518360,
  swapEnabled: true,
  symbol: 'staBAL3',
  name: 'Balancer USD Stable Pool',
  tokens: [
    {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      balance: '2617939.693336192520742293',
      weight: null,
      priceRate: '1',
      symbol: 'DAI',
      decimals: 18,
      token: {
        pool: null,
      },
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      balance: '2635260.326845',
      weight: null,
      priceRate: '1',
      symbol: 'USDC',
      decimals: 6,
      token: {
        pool: null,
      },
    },
    {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      balance: '2355531.908214',
      weight: null,
      priceRate: '1',
      symbol: 'USDT',
      decimals: 6,
      token: {
        pool: null,
      },
    },
  ],
  isNew: false,
  unwrappedTokens: [],
  onchain: {
    tokens: {
      '0x6b175474e89094c44da98b954eedeac495271d0f': {
        decimals: 18,
        balance: '2617939.693336192520742293',
        weight: 0.3333333333333333,
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      },
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        decimals: 6,
        balance: '2635260.326845',
        weight: 0.3333333333333333,
        symbol: 'USDC',
        name: 'USD Coin',
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      '0xdac17f958d2ee523a2206206994597c13d831ec7': {
        decimals: 6,
        balance: '2355531.908214',
        weight: 0.3333333333333333,
        symbol: 'USDT',
        name: 'Tether USD',
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
    },
    amp: '1390',
    swapEnabled: true,
    totalSupply: '7533503.744048508708028943',
    decimals: 18,
    swapFee: '0.00005',
  },
  feesSnapshot: '263.72978398572616665883285',
  volumeSnapshot: '5274595.679714523333176657',
  apr: {
    swap: '0.00632639482729956',
    yield: {
      total: '0',
      breakdown: {},
    },
    staking: {
      bal: {
        min: '0.004823948022214154',
        max: '0.012059870055535385',
      },
      rewards: '0',
    },
    total: {
      unstaked: '0.00632639482729956',
      staked: {
        max: '0.018386264882834945',
        min: '0.011150342849513714',
      },
    },
  },
};

export const testAmpUpdates = [
  {
    id: '0x4c54b3109c30a1098c5aeb56ea9a9c538476603509223086109d487ed98be058347',
    poolId: {
      id: '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      symbol: 'B-stETH-STABLE',
    },
    startTimestamp: '1628875520',
    endTimestamp: '1628875520',
    startAmp: '50000',
    endAmp: '50000',
  },
];
