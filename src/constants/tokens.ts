import { configService } from '@/services/config/config.service';

export const TOKENS = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'AAVE', 'WETH']
  },
  AddressMap: {
    '1': {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      BAL: '0xba100000625a3754423978a60c9317c58a424e3d'
    },
    '42': {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      WETH: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
      BAL: '0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7'
    },
    '137': {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      BAL: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'
    },
    '42161': {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      BAL: '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8'
    }
  },
  Prices: {
    ChainMap: {
      '42': {
        '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1':
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648':
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7':
          '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x8f4bebf498cc624a0797fe64114a6ff169eee078':
          '0xbc396689893d065f41bc2c6ecbee5e0085233447',
        '0xaf9ac3235be96ed496db7969f60d354fe5e426b0':
          '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115':
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0x04df6e4121c27713ed22341e7c7df330f56f289b':
          '0x6b175474e89094c44da98b954eedeac495271d0f'
      },
      '42161': {
        '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8':
          '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978':
          '0xd533a949740bb3306d119cc777fa900ba034cd52',
        '0x2e9a6df78e42a30712c10a9dc4b1c8656f8f2879':
          '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        '0x354a6da3fcde098f8389cad84b0182725c6c91de':
          '0xc00e94cb662c3520282e6f5717214004a7f26888',
        '0x23a941036ae778ac51ab04cea08ed6e2fe103614':
          '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
        '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f':
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1':
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x82e3a8f066a6989666b031d916c43672085b1582':
          '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
        '0xa0b862f60edef4452f25b4160f177db44deb6cf1':
          '0x6810e776880c02933d47db1b9fc05908e5386b96',
        '0xc3ae0333f0f34aa734d5493276223d95b8f9cb37':
          '0xa1d65e8fb6e87b60feccbc582f7f97804b725521',
        '0xd4d42f0b6def4ce0383636770ef773390d85c61a':
          '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
        '0xef888bca6ab6b1d26dbec977c455388ecd794794':
          '0xd291e7a03283640fdc51b121ac401383a46cc623',
        '0xf4d48ce3ee1ac3651998971541badbb9a14d7234':
          '0x2ba592f78db6436527729929aaf6c908497cb200',
        '0xf97f4df75117a78c1a5a0dbb814af92458539fb4':
          '0x514910771af9ca656af840dff83e8264ecf986ca',
        '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0':
          '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8':
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      }
    },
    // TODO - remove once coingecko supports wstETH
    ExchangeRates: {
      wstETH: {
        stETH: 1.0352
      }
    }
  }
};

export const NATIVE_ASSET_ADDRESS = configService.network.nativeAsset.address;
export const DEFAULT_TOKEN_DECIMALS = 18;
