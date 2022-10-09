import { Network } from '@balancer-labs/sdk';

import { networkId } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
type CommonTokens = {
  nativeAsset: string;
  wNativeAsset: string;
  WETH: string;
  BAL: string;
  bbaUSD?: string;
  bbaUSDv2?: string;
};

type TokenConstants = {
  Popular: {
    Symbols: string[];
  };
  Addresses: CommonTokens;
  PriceChainMap?: Record<string, string>;
};

/**
 * CONSTANTS
 */
export const NATIVE_ASSET_ADDRESS = configService.network.nativeAsset.address;
export const DEFAULT_TOKEN_DECIMALS = 18;

export const TOKENS_MAINNET: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    BAL: '0xba100000625a3754423978a60c9317c58a424e3d',
    bbaUSD: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
    bbaUSDv2: '0xA13a9247ea42D743238089903570127DdA72fE44',
  },
};

export const TOKENS_POLYGON: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    BAL: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
  },
};

export const TOKENS_ARBITRUM: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    BAL: '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',
  },
};

export const TOKENS_KOVAN: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    WETH: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    BAL: '0xcb355677E36f390Ccc4a5d4bEADFbF1Eb2071c81',
    bbaUSD: '0x8fd162f338B770F7E879030830cDe9173367f301',
  },
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from kovan to mainnet, e.g
     * [kovan address]: mainnet address
     */
    '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1':
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648':
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    // '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7':
    //   '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x8f4bebf498cc624a0797fe64114a6ff169eee078':
      '0xbc396689893d065f41bc2c6ecbee5e0085233447',
    '0xaf9ac3235be96ed496db7969f60d354fe5e426b0':
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    // BAL
    '0xcb355677e36f390ccc4a5d4beadfbf1eb2071c81':
      '0xba100000625a3754423978a60c9317c58a424e3d',
    // USDC
    '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115':
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x04df6e4121c27713ed22341e7c7df330f56f289b':
      '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x4803bb90d18a1cb7a2187344fe4feb0e07878d05':
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    // AAVE DAI
    '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd':
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    // AAVE USDC
    '0xe22da380ee6b445bb8273c81944adeb6e8450422':
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    // AAVE USDT
    '0x13512979ade267ab5100878e2e0f485b568328a4':
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    // wstETH
    '0xa387b91e393cfb9356a460370842bc8dbb2f29af':
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  },
};

export const TOKENS_GOERLI: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'USDT', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    WETH: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    BAL: '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
    bbaUSD: '0x13ACD41C585d7EbB4a9460f7C8f50BE60DC080Cd',
  },
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from goerli to mainnet, e.g
     * [goerli address]: mainnet address
     */
    '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1':
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x37f03a12241e9fd3658ad6777d289c3fb8512bc9':
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0xfa8449189744799ad2ace7e0ebac8bb7575eff47':
      '0xba100000625a3754423978a60c9317c58a424e3d',
    '0xe0c9275e44ea80ef17579d33c55136b7da269aeb':
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x8c9e6c40d3402480ace624730524facc5482798c':
      '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x1f1f156e0317167c11aa412e3d1435ea29dc3cce':
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x4cb1892fddf14f772b2e39e299f44b2e5da90d04':
      '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
    '0x811151066392fd641fe74a9b55a712670572d161':
      '0xbcca60bb61934080951369a648fb03df4f96263c',
    '0x89534a24450081aa267c79b07411e9617d984052':
      '0x028171bca77440897b824ca71d1c56cac55b68a3',
    '0x829f35cebbcd47d3c120793c12f7a232c903138b':
      '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
    '0xff386a3d08f80ac38c77930d173fa56c6286dc8b':
      '0x6810e776880c02933d47db1b9fc05908e5386b96',
  },
};

export const TOKENS_GENERIC: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH'],
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: '0x0000000000000000000000000000000000000000',
    BAL: '0x0000000000000000000000000000000000000000',
  },
};

const TOKENS_MAP = {
  [Network.KOVAN]: TOKENS_KOVAN,
  [Network.GOERLI]: TOKENS_GOERLI,
  [Network.MAINNET]: TOKENS_MAINNET,
  [Network.POLYGON]: TOKENS_POLYGON,
  [Network.ARBITRUM]: TOKENS_ARBITRUM,
};

export const TOKENS: TokenConstants = TOKENS_MAP[networkId.value]
  ? TOKENS_MAP[networkId.value]
  : TOKENS_GENERIC;
