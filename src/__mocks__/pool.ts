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
      token: { pool: null },
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      balance: '95.094102533755196937',
      priceRate: '1',
      weight: '0.2',
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

// Copy & paste of polygon bb-am-USD boosted pool logged to console.
// export const BoostedPoolMock: Pool = {
//   id: '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b',
//   address: '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085',
//   poolType: 'ComposableStable',
//   swapFee: '0.0001',
//   tokensList: [
//     '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//     '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//     '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//   ],
//   totalLiquidity: '27553.39192218862436032086241022769',
//   totalSwapVolume: '38477.3850734811667303422542659704',
//   totalSwapFee: '3.84773850734811667303422542659704',
//   totalShares: '27540.291900658743913276',
//   owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
//   factory: '0x136fd06fa01ecf624c7f2b3cb15742c1339dc2c4',
//   amp: '1472',
//   createTime: 1662565651,
//   swapEnabled: true,
//   symbol: 'bb-am-usd',
//   name: 'Balancer Aave Boosted StablePool',
//   tokens: [
//     {
//       address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//       balance: '9031.344962205277394965',
//       weight: null,
//       priceRate: '1',
//       symbol: 'bb-am-DAI',
//       decimals: 18,
//       token: {
//         pool: {
//           id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//           poolType: 'AaveLinear',
//           tokens: [
//             {
//               address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//               balance: '5192296858525796.26727874821073227',
//               weight: null,
//               priceRate: '1',
//               symbol: 'bb-am-DAI',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//                       balance: '5192296858525796.26727874821073227',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-DAI',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//                           poolType: PoolType.AaveLinear,
//                         },
//                       },
//                     },
//                     {
//                       address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
//                       balance: '9031.361251748118487825',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'DAI',
//                       decimals: 18,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xee029120c72b0607344f35b17cdd90025e647b00',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amDAI',
//                       decimals: 18,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
//               balance: '9031.361251748118487825',
//               weight: null,
//               priceRate: '1',
//               symbol: 'DAI',
//               decimals: 18,
//               token: {
//                 pool: null,
//               },
//             },
//             {
//               address: '0xee029120c72b0607344f35b17cdd90025e647b00',
//               balance: '0',
//               weight: null,
//               priceRate: '1',
//               symbol: 'amDAI',
//               decimals: 18,
//               token: {
//                 pool: null,
//               },
//             },
//           ],
//         },
//       },
//     },
//     {
//       address: '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085',
//       balance: '2596148429239881.265177793235869197',
//       weight: null,
//       priceRate: '1',
//       symbol: 'bb-am-usd',
//       decimals: 18,
//       token: {
//         pool: {
//           id: '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b',
//           poolType: 'ComposableStable',
//           tokens: [
//             {
//               address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//               balance: '9031.344962205277394965',
//               weight: null,
//               priceRate: '1',
//               symbol: 'bb-am-DAI',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//                       balance: '5192296858525796.26727874821073227',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-DAI',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                     {
//                       address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
//                       balance: '9031.361251748118487825',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'DAI',
//                       decimals: 18,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xee029120c72b0607344f35b17cdd90025e647b00',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amDAI',
//                       decimals: 18,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               address: '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085',
//               balance: '2596148429239881.265177793235869197',
//               weight: null,
//               priceRate: '1',
//               symbol: 'bb-am-usd',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b',
//                   poolType: 'ComposableStable',
//                   tokens: [
//                     {
//                       address: '0x178e029173417b1f9c8bc16dcec6f697bc323746',
//                       balance: '9031.344962205277394965',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-DAI',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                     {
//                       address: '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085',
//                       balance: '2596148429239881.265177793235869197',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-usd',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b',
//                           poolType: 'ComposableStable',
//                         },
//                       },
//                     },
//                     {
//                       address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//                       balance: '10136.567231739786242913',
//                       weight: null,
//                       priceRate: '1.000000013835417172',
//                       symbol: 'bb-am-USDC',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                     {
//                       address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//                       balance: '8385.479429334338915073',
//                       weight: null,
//                       priceRate: '1.000000018921468571',
//                       symbol: 'bb-am-USDT',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//               balance: '10136.567231739786242913',
//               weight: null,
//               priceRate: '1.000000013835417172',
//               symbol: 'bb-am-USDC',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x221836a597948dce8f3568e044ff123108acc42a',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amUSDC',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//                       balance: '10138.58407',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'USDC',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//                       balance: '5192296858524689.044600767867418753',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-USDC',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//             {
//               address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//               balance: '8385.479429334338915073',
//               weight: null,
//               priceRate: '1.000000018921468571',
//               symbol: 'bb-am-USDT',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amUSDT',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//                       balance: '8385.497883',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'USDT',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//                       balance: '5192296858526442.130806162260855052',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-USDT',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//     {
//       address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//       balance: '10136.567231739786242913',
//       weight: null,
//       priceRate: '1.000000013835417172',
//       symbol: 'bb-am-USDC',
//       decimals: 18,
//       token: {
//         pool: {
//           id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//           poolType: 'AaveLinear',
//           tokens: [
//             {
//               address: '0x221836a597948dce8f3568e044ff123108acc42a',
//               balance: '0',
//               weight: null,
//               priceRate: '1',
//               symbol: 'amUSDC',
//               decimals: 6,
//               token: {
//                 pool: null,
//               },
//             },
//             {
//               address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//               balance: '10138.58407',
//               weight: null,
//               priceRate: '1',
//               symbol: 'USDC',
//               decimals: 6,
//               token: {
//                 pool: null,
//               },
//             },
//             {
//               address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//               balance: '5192296858524689.044600767867418753',
//               weight: null,
//               priceRate: '1',
//               symbol: 'bb-am-USDC',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x221836a597948dce8f3568e044ff123108acc42a',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amUSDC',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//                       balance: '10138.58407',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'USDC',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xf93579002dbe8046c43fefe86ec78b1112247bb8',
//                       balance: '5192296858524689.044600767867418753',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-USDC',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//     {
//       address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//       balance: '8385.479429334338915073',
//       weight: null,
//       priceRate: '1.000000018921468571',
//       symbol: 'bb-am-USDT',
//       decimals: 18,
//       token: {
//         pool: {
//           id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//           poolType: 'AaveLinear',
//           tokens: [
//             {
//               address: '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
//               balance: '0',
//               weight: null,
//               priceRate: '1',
//               symbol: 'amUSDT',
//               decimals: 6,
//               token: {
//                 pool: null,
//               },
//             },
//             {
//               address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//               balance: '8385.497883',
//               weight: null,
//               priceRate: '1',
//               symbol: 'USDT',
//               decimals: 6,
//               token: {
//                 pool: null,
//               },
//             },
//             {
//               address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//               balance: '5192296858526442.130806162260855052',
//               weight: null,
//               priceRate: '1',
//               symbol: 'bb-am-USDT',
//               decimals: 18,
//               token: {
//                 pool: {
//                   id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//                   poolType: 'AaveLinear',
//                   tokens: [
//                     {
//                       address: '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
//                       balance: '0',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'amUSDT',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//                       balance: '8385.497883',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'USDT',
//                       decimals: 6,
//                       token: {
//                         pool: null,
//                       },
//                     },
//                     {
//                       address: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6',
//                       balance: '5192296858526442.130806162260855052',
//                       weight: null,
//                       priceRate: '1',
//                       symbol: 'bb-am-USDT',
//                       decimals: 18,
//                       token: {
//                         pool: {
//                           id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//                           poolType: 'AaveLinear',
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//   ],
//   isNew: false,
//   unwrappedTokens: [],
//   onchain: {
//     tokens: {
//       '0x178e029173417b1f9c8bc16dcec6f697bc323746': {
//         decimals: 18,
//         balance: '9031.344962205277394965',
//         weight: 0.3333333333333333,
//         symbol: 'bb-am-DAI',
//         name: 'Balancer Aave Boosted Pool (DAI)',
//         logoURI:
//           'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0x178e029173417b1f9c8bc16dcec6f697bc323746.png',
//       },
//       '0xf93579002dbe8046c43fefe86ec78b1112247bb8': {
//         decimals: 18,
//         balance: '10136.567231739786242913',
//         weight: 0.3333333333333333,
//         symbol: 'bb-am-USDC',
//         name: 'Balancer Aave Boosted Pool (USDC)',
//         logoURI:
//           'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0xf93579002dbe8046c43fefe86ec78b1112247bb8.png',
//       },
//       '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6': {
//         decimals: 18,
//         balance: '8385.479429334338915073',
//         weight: 0.3333333333333333,
//         symbol: 'bb-am-USDT',
//         name: 'Balancer Aave Boosted Pool (USDT)',
//         logoURI:
//           'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6.png',
//       },
//     },
//     amp: '1472',
//     swapEnabled: true,
//     linearPools: {
//       '0x178e029173417b1f9c8bc16dcec6f697bc323746': {
//         id: '0x178e029173417b1f9c8bc16dcec6f697bc323746000000000000000000000758',
//         priceRate: '1.0',
//         mainToken: {
//           address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
//           index: 1,
//           balance: '9031361251748118487825',
//         },
//         wrappedToken: {
//           address: '0xEE029120c72b0607344f35B17cdD90025e647B00',
//           index: 2,
//           balance: '0',
//           priceRate: '1.042766265318917163',
//         },
//         unwrappedTokenAddress: '0x27F8D03b3a2196956ED754baDc28D73be8830A6e',
//         totalSupply: '9031.361251748118487825',
//       },
//       '0xf93579002dbe8046c43fefe86ec78b1112247bb8': {
//         id: '0xf93579002dbe8046c43fefe86ec78b1112247bb8000000000000000000000759',
//         priceRate: '1.000000013835417172',
//         mainToken: {
//           address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
//           index: 1,
//           balance: '10138584070',
//         },
//         wrappedToken: {
//           address: '0x221836a597948Dce8F3568E044fF123108aCc42A',
//           index: 0,
//           balance: '0',
//           priceRate: '1.038377711445612865',
//         },
//         unwrappedTokenAddress: '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F',
//         totalSupply: '10138.583929728461801342',
//       },
//       '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6': {
//         id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea600000000000000000000075a',
//         priceRate: '1.000000018921468571',
//         mainToken: {
//           address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
//           index: 1,
//           balance: '8385497883',
//         },
//         wrappedToken: {
//           address: '0x19C60a251e525fa88Cd6f3768416a8024e98fC19',
//           index: 0,
//           balance: '0',
//           priceRate: '1.075175725148863934',
//         },
//         unwrappedTokenAddress: '0x60D55F02A771d515e077c9C2403a1ef324885CeC',
//         totalSupply: '8385.497724334068365043',
//       },
//     },
//     tokenRates: ['1.0', '1.000000013835417172', '1.000000018921468571'],
//     totalSupply: '27540.291900658743913276',
//     decimals: 18,
//     swapFee: '0.0001',
//   },
//   feesSnapshot: '0.100162292110836202603087535263243',
//   volumeSnapshot: '1001.62292110836202603087535263243',
//   mainTokens: [
//     '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
//     '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//     '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   ],
//   wrappedTokens: [
//     '0xee029120c72b0607344f35b17cdd90025e647b00',
//     '0x221836a597948dce8f3568e044ff123108acc42a',
//     '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
//   ],
//   linearPoolTokensMap: {
//     '0x221836a597948dce8f3568e044ff123108acc42a': {
//       address: '0x221836a597948dce8f3568e044ff123108acc42a',
//       balance: '0',
//       weight: null,
//       priceRate: '1',
//       symbol: 'amUSDC',
//       decimals: 6,
//       token: {
//         pool: null,
//       },
//     },
//     '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': {
//       address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//       balance: '10138.58407',
//       weight: null,
//       priceRate: '1',
//       symbol: 'USDC',
//       decimals: 6,
//       token: {
//         pool: null,
//       },
//     },
//     '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': {
//       address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
//       balance: '9031.361251748118487825',
//       weight: null,
//       priceRate: '1',
//       symbol: 'DAI',
//       decimals: 18,
//       token: {
//         pool: null,
//       },
//     },
//     '0xee029120c72b0607344f35b17cdd90025e647b00': {
//       address: '0xee029120c72b0607344f35b17cdd90025e647b00',
//       balance: '0',
//       weight: null,
//       priceRate: '1',
//       symbol: 'amDAI',
//       decimals: 18,
//       token: {
//         pool: null,
//       },
//     },
//     '0x19c60a251e525fa88cd6f3768416a8024e98fc19': {
//       address: '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
//       balance: '0',
//       weight: null,
//       priceRate: '1',
//       symbol: 'amUSDT',
//       decimals: 6,
//       token: {
//         pool: null,
//       },
//     },
//     '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': {
//       address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//       balance: '8385.497883',
//       weight: null,
//       priceRate: '1',
//       symbol: 'USDT',
//       decimals: 6,
//       token: {
//         pool: null,
//       },
//     },
//   },
// };
