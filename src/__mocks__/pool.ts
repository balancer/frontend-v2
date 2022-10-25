import { Pool, PoolType } from '@/services/pool/types';

export const PoolMock: Pool = {
  onchain: {
    tokens: {
      '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7': {
        decimals: 18,
        balance: '408730.214628374105060109',
        weight: 0.8,
        symbol: 'GRO',
        name: 'Gro DAO Token',
        logoURI:
          'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7.png',
      },
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        decimals: 18,
        balance: '95.094102533755196937',
        weight: 0.2,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      },
    },
    amp: '0',
    swapEnabled: true,
    totalSupply: '150501.891977546028526082',
    decimals: 18,
    swapFee: '0.0037',
  },
  symbol: 'GRO-WETH',
  address: '0x702605F43471183158938C1a3e5f5A359d7b31ba',
  createTime: 1633385013,
  name: 'GRO-WETH',
  factory: '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9',
  id: '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  poolType: PoolType.Weighted,
  swapFee: '0.0037',
  tokens: [
    {
      address: '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
      balance: '408784.606604112667634055',
      priceRate: '1',
      weight: '0.8',
      decimals: 18,
      token: { pool: null },
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      balance: '95.094102533755196937',
      priceRate: '1',
      weight: '0.2',
      decimals: 18,
      token: { pool: null },
    },
  ],
  tokensList: [
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ],
  totalLiquidity: '1203724.083931267693503729',
  totalShares: '150501.891977546028526082',
  totalSwapFee: '165820.9454823753843641664971705477',
  totalSwapVolume: '52262349.4122392298543195893618041',
};

export const BoostedPoolMock: Pool = {
  id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
  address: '0xa13a9247ea42d743238089903570127dda72fe44',
  poolType: PoolType.ComposableStable,
  swapFee: '0.00001',
  tokensList: [
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ],
  totalLiquidity: '99886208.31585153000277710218205609',
  totalSwapVolume: '45850374.28885127777406882174185519',
  totalSwapFee: '2425.049285139938325186394880474096',
  totalShares: '99799130.831351775073019636',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  factory: '0xf9ac7b9df2b3454e841110cce5550bd5ac6f875f',
  createTime: 1662537668,
  symbol: 'bb-a-USD',
  name: 'Balancer Aave Boosted StablePool',
  tokens: [
    {
      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
      balance: '33345329.826951213979096783',
      weight: '',
      priceRate: '1.001192531976425769',
      symbol: 'bb-a-USDT',
      decimals: 18,
      token: {
        pool: {
          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
          poolType: PoolType.Stable,
          tokens: [
            {
              address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
              balance: '5192296825189375.700421180359267143',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USDT',
              decimals: 18,
              token: {
                pool: {
                  id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '5192296825189375.700421180359267143',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                      balance: '4285243.237571',
                      weight: '',
                      priceRate: '1',
                      symbol: 'USDT',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
                      balance: '26600076.077163',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aUSDT',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
              balance: '4285243.237571',
              weight: '',
              priceRate: '1',
              symbol: 'USDT',
              decimals: 6,
              token: {
                pool: null,
              },
            },
            {
              address: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
              balance: '26600076.077163',
              weight: '',
              priceRate: '1',
              symbol: 'aUSDT',
              decimals: 6,
              token: {
                pool: null,
              },
            },
          ],
        },
      },
    },
    {
      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
      balance: '33397850.527616149474983742',
      weight: '',
      priceRate: '1.00046211632192687',
      symbol: 'bb-a-USDC',
      decimals: 18,
      token: {
        pool: {
          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
          poolType: PoolType.Stable,
          tokens: [
            {
              address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
              balance: '5192296825136749.660746694842359358',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USDC',
              decimals: 18,
              token: {
                pool: {
                  id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '5192296825136749.660746694842359358',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                      balance: '11702946.30069',
                      weight: '',
                      priceRate: '1',
                      symbol: 'USDC',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
                      balance: '20137370.798723',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aUSDC',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              balance: '11702946.30069',
              weight: '',
              priceRate: '1',
              symbol: 'USDC',
              decimals: 6,
              token: {
                pool: null,
              },
            },
            {
              address: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
              balance: '20137370.798723',
              weight: '',
              priceRate: '1',
              symbol: 'aUSDC',
              decimals: 6,
              token: {
                pool: null,
              },
            },
          ],
        },
      },
    },
    {
      address: '0xa13a9247ea42d743238089903570127dda72fe44',
      balance: '2596148329489016.674650662888664785',
      weight: '',
      priceRate: '1',
      symbol: 'bb-a-USD',
      decimals: 18,
      token: {
        pool: {
          id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
          poolType: PoolType.ComposableStable,
          tokens: [
            {
              address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
              balance: '33345329.826951213979096783',
              weight: '',
              priceRate: '1.001192531976425769',
              symbol: 'bb-a-USDT',
              decimals: 18,
              token: {
                pool: {
                  id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '5192296825189375.700421180359267143',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                      balance: '4285243.237571',
                      weight: '',
                      priceRate: '1',
                      symbol: 'USDT',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
                      balance: '26600076.077163',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aUSDT',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
              balance: '33397850.527616149474983742',
              weight: '',
              priceRate: '1.00046211632192687',
              symbol: 'bb-a-USDC',
              decimals: 18,
              token: {
                pool: {
                  id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '5192296825136749.660746694842359358',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                      balance: '11702946.30069',
                      weight: '',
                      priceRate: '1',
                      symbol: 'USDC',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
                      balance: '20137370.798723',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aUSDC',
                      decimals: 6,
                      token: {
                        pool: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0xa13a9247ea42d743238089903570127dda72fe44',
              balance: '2596148329489016.674650662888664785',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USD',
              decimals: 18,
              token: {
                pool: {
                  id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
                  poolType: PoolType.ComposableStable,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '33345329.826951213979096783',
                      weight: '',
                      priceRate: '1.001192531976425769',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '33397850.527616149474983742',
                      weight: '',
                      priceRate: '1.00046211632192687',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                    {
                      address: '0xa13a9247ea42d743238089903570127dda72fe44',
                      balance: '2596148329489016.674650662888664785',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USD',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
                          poolType: PoolType.ComposableStable,
                        },
                      },
                    },
                    {
                      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
                      balance: '33061198.478906406886871026',
                      weight: '',
                      priceRate: '1.000799958220877236',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0xae37d54ae477268b9997d4161b96b8200755935c',
              balance: '33061198.478906406886871026',
              weight: '',
              priceRate: '1.000799958220877236',
              symbol: 'bb-a-DAI',
              decimals: 18,
              token: {
                pool: {
                  id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
                      balance: '22788771.325595235298610053',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aDAI',
                      decimals: 18,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                      balance: '8555392.785412034844172139',
                      weight: '',
                      priceRate: '1',
                      symbol: 'DAI',
                      decimals: 18,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
                      balance: '5192296825473405.66334724567164977',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
      balance: '33061198.478906406886871026',
      weight: '',
      priceRate: '1.000799958220877236',
      symbol: 'bb-a-DAI',
      decimals: 18,
      token: {
        pool: {
          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
          poolType: PoolType.Stable,
          tokens: [
            {
              address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
              balance: '22788771.325595235298610053',
              weight: '',
              priceRate: '1',
              symbol: 'aDAI',
              decimals: 18,
              token: {
                pool: null,
              },
            },
            {
              address: '0x6b175474e89094c44da98b954eedeac495271d0f',
              balance: '8555392.785412034844172139',
              weight: '',
              priceRate: '1',
              symbol: 'DAI',
              decimals: 18,
              token: {
                pool: null,
              },
            },
            {
              address: '0xae37d54ae477268b9997d4161b96b8200755935c',
              balance: '5192296825473405.66334724567164977',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-DAI',
              decimals: 18,
              token: {
                pool: {
                  id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                  poolType: PoolType.Stable,
                  tokens: [
                    {
                      address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
                      balance: '22788771.325595235298610053',
                      weight: '',
                      priceRate: '1',
                      symbol: 'aDAI',
                      decimals: 18,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                      balance: '8555392.785412034844172139',
                      weight: '',
                      priceRate: '1',
                      symbol: 'DAI',
                      decimals: 18,
                      token: {
                        pool: null,
                      },
                    },
                    {
                      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
                      balance: '5192296825473405.66334724567164977',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.Stable,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
  isNew: false,
  unwrappedTokens: [],
  onchain: {
    tokens: {
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb': {
        decimals: 18,
        balance: '33345329.826951213979096783',
        weight: 0.3333333333333333,
        symbol: 'bb-a-USDT',
        name: 'Balancer Aave Boosted Pool (USDT)',
        logoURI:
          'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x2f4eb100552ef93840d5adc30560e5513dfffacb.png',
      },
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83': {
        decimals: 18,
        balance: '33397850.527616149474983742',
        weight: 0.3333333333333333,
        symbol: 'bb-a-USDC',
        name: 'Balancer Aave Boosted Pool (USDC)',
        logoURI:
          'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x82698aecc9e28e9bb27608bd52cf57f704bd1b83.png',
      },
      '0xae37d54ae477268b9997d4161b96b8200755935c': {
        decimals: 18,
        balance: '33061198.478906406886871026',
        weight: 0.3333333333333333,
        symbol: 'bb-a-DAI',
        name: 'Balancer Aave Boosted Pool (DAI)',
        logoURI:
          'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xae37d54ae477268b9997d4161b96b8200755935c.png',
      },
    },
    amp: '1472',
    swapEnabled: true,
    linearPools: {
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb': {
        id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
        priceRate: '1.001200308242349742',
        mainToken: {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          index: 1,
          balance: '4285243237571',
        },
        wrappedToken: {
          address: '0xf8Fd466F12e236f4c96F7Cce6c79EAdB819abF58',
          index: 2,
          balance: '26600076077163',
          priceRate: '1.093990612166555654',
        },
        unwrappedTokenAddress: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
        totalSupply: '33345451.928109315969952952',
      },
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83': {
        id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
        priceRate: '1.000466074187323998',
        mainToken: {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          index: 1,
          balance: '11702436987288',
        },
        wrappedToken: {
          address: '0xd093fA4Fb80D09bB30817FDcd442d4d02eD3E5de',
          index: 2,
          balance: '20137843203295',
          priceRate: '1.078129705518333882',
        },
        unwrappedTokenAddress: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        totalSupply: '33398077.967783801486860737',
      },
      '0xae37d54ae477268b9997d4161b96b8200755935c': {
        id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
        priceRate: '1.000803473997347899',
        mainToken: {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          index: 1,
          balance: '8555392785412034844172139',
        },
        wrappedToken: {
          address: '0x02d60b84491589974263d922D9cC7a3152618Ef6',
          index: 0,
          balance: '22788771325595235298610053',
          priceRate: '1.07652109989281328',
        },
        unwrappedTokenAddress: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
        totalSupply: '33061421.965183250657570325',
      },
    },
    tokenRates: [
      '1.001192531976425769',
      '1.00046211632192687',
      '1.000799958220877236',
    ],
    totalSupply: '99799132.202804473291313776',
    decimals: 18,
    swapFee: '0.00001',
  },
  feesSnapshot: '155.927470133142851684111226120013',
  volumeSnapshot: '15592747.0133142851684111226120014',
  mainTokens: [
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ],
  wrappedTokens: [
    '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
    '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
    '0x02d60b84491589974263d922d9cc7a3152618ef6',
  ],
  linearPoolTokensMap: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      balance: '11702946.30069',
      weight: '',
      priceRate: '1',
      symbol: 'USDC',
      decimals: 6,
      token: {
        pool: null,
      },
    },
    '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de': {
      address: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
      balance: '20137370.798723',
      weight: '',
      priceRate: '1',
      symbol: 'aUSDC',
      decimals: 6,
      token: {
        pool: null,
      },
    },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      balance: '4285243.237571',
      weight: '',
      priceRate: '1',
      symbol: 'USDT',
      decimals: 6,
      token: {
        pool: null,
      },
    },
    '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58': {
      address: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
      balance: '26600076.077163',
      weight: '',
      priceRate: '1',
      symbol: 'aUSDT',
      decimals: 6,
      token: {
        pool: null,
      },
    },
    '0x02d60b84491589974263d922d9cc7a3152618ef6': {
      address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
      balance: '22788771.325595235298610053',
      weight: '',
      priceRate: '1',
      symbol: 'aDAI',
      decimals: 18,
      token: {
        pool: null,
      },
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      balance: '8555392.785412034844172139',
      weight: '',
      priceRate: '1',
      symbol: 'DAI',
      decimals: 18,
      token: {
        pool: null,
      },
    },
  },
};
