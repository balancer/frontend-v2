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
    '0xa13a9247ea42d743238089903570127dda72fe44',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ],
  totalLiquidity: '129582787.0890880814133041814085484',
  totalSwapVolume: '260432002.4421270620735632848253712',
  totalSwapFee: '4570.865566672696168181339511309256',
  totalShares: '129467502.524175958648827523',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  factory: '0xf9ac7b9df2b3454e841110cce5550bd5ac6f875f',
  createTime: 1662537668,
  symbol: 'bb-a-USD',
  name: 'Balancer Aave Boosted StablePool',
  tokens: [
    {
      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
      balance: '34479736.617522694777495036',
      weight: '',
      priceRate: '1.001509189477538017',
      symbol: 'bb-a-USDT',
      decimals: 18,
      token: {
        pool: {
          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
              balance: '5192296824054968.90984969956086889',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USDT',
              decimals: 18,
              token: {
                pool: {
                  id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '5192296824054968.90984969956086889',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                      balance: '8160680.022892',
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
                      balance: '24095652.502028',
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
              balance: '8160680.022892',
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
              balance: '24095652.502028',
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
      balance: '48297528.396152954450839259',
      weight: '',
      priceRate: '1.000582681372697502',
      symbol: 'bb-a-USDC',
      decimals: 18,
      token: {
        pool: {
          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
              balance: '5192296810237052.479811202677320249',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USDC',
              decimals: 18,
              token: {
                pool: {
                  id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '5192296810237052.479811202677320249',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                      balance: '17148799.021266',
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
                      balance: '28912716.694914',
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
              balance: '17148799.021266',
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
              balance: '28912716.694914',
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
      balance: '2596148299831654.250907939521257593',
      weight: '',
      priceRate: '1',
      symbol: 'bb-a-USD',
      decimals: 18,
      token: {
        pool: {
          id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
          poolType: PoolType.ComposableStable,
          mainIndex: 0,
          tokens: [
            {
              address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
              balance: '34479736.617522694777495036',
              weight: '',
              priceRate: '1.001509189477538017',
              symbol: 'bb-a-USDT',
              decimals: 18,
              token: {
                pool: {
                  id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '5192296824054968.90984969956086889',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                      balance: '8160680.022892',
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
                      balance: '24095652.502028',
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
              balance: '48297528.396152954450839259',
              weight: '',
              priceRate: '1.000582681372697502',
              symbol: 'bb-a-USDC',
              decimals: 18,
              token: {
                pool: {
                  id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '5192296810237052.479811202677320249',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                      balance: '17148799.021266',
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
                      balance: '28912716.694914',
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
              balance: '2596148299831654.250907939521257593',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-USD',
              decimals: 18,
              token: {
                pool: {
                  id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
                  poolType: PoolType.ComposableStable,
                  mainIndex: 0,
                  tokens: [
                    {
                      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
                      balance: '34479736.617522694777495036',
                      weight: '',
                      priceRate: '1.001509189477538017',
                      symbol: 'bb-a-USDT',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
                      balance: '48297528.396152954450839259',
                      weight: '',
                      priceRate: '1.000582681372697502',
                      symbol: 'bb-a-USDC',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83000000000000000000000336',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                    {
                      address: '0xa13a9247ea42d743238089903570127dda72fe44',
                      balance: '2596148299831654.250907939521257593',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-USD',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
                          poolType: PoolType.ComposableStable,
                          mainIndex: 0,
                        },
                      },
                    },
                    {
                      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
                      balance: '46694579.84496379152010581',
                      weight: '',
                      priceRate: '1.000900495809254379',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              address: '0xae37d54ae477268b9997d4161b96b8200755935c',
              balance: '46694579.84496379152010581',
              weight: '',
              priceRate: '1.000900495809254379',
              symbol: 'bb-a-DAI',
              decimals: 18,
              token: {
                pool: {
                  id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
                      balance: '25810645.481738532468751415',
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
                      balance: '18947250.406313118060126743',
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
                      balance: '5192296811840024.297289861038414986',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
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
      balance: '46694579.84496379152010581',
      weight: '',
      priceRate: '1.000900495809254379',
      symbol: 'bb-a-DAI',
      decimals: 18,
      token: {
        pool: {
          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
              balance: '25810645.481738532468751415',
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
              balance: '18947250.406313118060126743',
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
              balance: '5192296811840024.297289861038414986',
              weight: '',
              priceRate: '1',
              symbol: 'bb-a-DAI',
              decimals: 18,
              token: {
                pool: {
                  id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                  poolType: PoolType.AaveLinear,
                  mainIndex: 1,
                  tokens: [
                    {
                      address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
                      balance: '25810645.481738532468751415',
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
                      balance: '18947250.406313118060126743',
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
                      balance: '5192296811840024.297289861038414986',
                      weight: '',
                      priceRate: '1',
                      symbol: 'bb-a-DAI',
                      decimals: 18,
                      token: {
                        pool: {
                          id: '0xae37d54ae477268b9997d4161b96b8200755935c000000000000000000000337',
                          poolType: PoolType.AaveLinear,
                          mainIndex: 1,
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
};
