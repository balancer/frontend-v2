import useConfig from '@/composables/useConfig';
import { getNativeAssetId, getPlatformId } from './coingecko/coingecko.service';

function getChainAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    1: {},
    42: {
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
        '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xcc08220af469192c53295fdd34cfb8df29aa17ab':
        '0xdac17f958d2ee523a2206206994597c13d831ec7'
    },
    137: {}
  };
  return map[chainId][address.toLowerCase()] || address;
}

export function getOriginalAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    // WETH
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      42: '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    },
    // WBTC
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      42: '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648'
    },
    // BAL
    '0xba100000625a3754423978a60c9317c58a424e3d': {
      42: '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
      137: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'
    },
    // PERP
    '0xbc396689893d065f41bc2c6ecbee5e0085233447': {
      42: '0x8f4bebf498cc624a0797fe64114a6ff169eee078'
    },
    // MKR
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
      42: '0xaf9ac3235be96ed496db7969f60d354fe5e426b0'
    },
    // USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      42: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115'
    },
    // DAI
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      42: '0x04df6e4121c27713ed22341e7c7df330f56f289b'
    },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
      42: '0xcc08220af469192c53295fdd34cfb8df29aa17ab'
    }
  };
  if (!map[address] || !map[address][chainId]) {
    return address.toLowerCase();
  }
  return map[address][chainId];
}

interface Price {
  price: number;
  price24HChange: number;
}

export type Prices = Record<string, Price>;

export type HistoricalPrices = Record<string, Prices>;

export async function getEtherPrice(): Promise<Price> {
  const { env } = useConfig();
  const nativeAssetId = getNativeAssetId(env.NETWORK);
  const uri = `https://api.coingecko.com/api/v3/simple/price?ids=${nativeAssetId}&vs_currencies=usd&include_24hr_change=true`;
  const result = await fetch(uri).then(res => res.json());
  return {
    price: result[nativeAssetId].usd,
    price24HChange: result[nativeAssetId].usd_24h_change
  };
}

export async function getTokensPrice(
  chainId: number,
  addresses: string[]
): Promise<Prices> {
  const { env } = useConfig();

  const max = 175;
  const pages = Math.ceil(addresses.length / max);
  const promises = [];
  Array.from(Array(pages)).forEach((x, i) => {
    const addressString = addresses
      .slice(max * i, max * (i + 1))
      .map(address => getChainAddress(chainId, address));
    const uri = `https://api.coingecko.com/api/v3/simple/token_price/${getPlatformId(
      env.NETWORK
    )}?contract_addresses=${addressString}&vs_currencies=usd&include_24hr_change=true`;
    // @ts-ignore
    promises.push(fetch(uri).then(res => res.json()));
  });
  const results = await Promise.all(promises);
  const prices = results.reduce(
    (obj, result: any) => ({ ...obj, ...result }),
    {}
  );
  return Object.fromEntries(
    Object.entries(prices).map((token: any) => [
      getOriginalAddress(chainId, token[0]),
      {
        price: token[1].usd,
        price24HChange: token[1].usd_24h_change
      }
    ])
  );
}

export async function getTokensHistoricalPrice(
  chainId: number,
  addresses: string[],
  days: number
): Promise<HistoricalPrices> {
  const { env } = useConfig();

  const DAY = 60 * 60 * 24;
  const now = Math.floor(Date.now() / 1000);
  const end = now - (now % DAY);
  const start = end - days * DAY;
  const priceRequests = addresses.map(address => {
    const chainAddress = getChainAddress(chainId, address);
    const url = `https://api.coingecko.com/api/v3/coins/${getPlatformId(
      env.NETWORK
    )}/contract/${chainAddress}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`;
    const request = fetch(url).then(res => res.json());
    return request;
  });
  const results = await Promise.all(priceRequests);

  const assetPrices = Object.fromEntries(
    addresses.map((chainAddress, index) => {
      const address = getOriginalAddress(chainId, chainAddress);
      const result = (results[index] as any).prices as number[][];
      const prices = {};
      let dayTimestamp = start;
      for (const key in result) {
        const value = result[key];
        const [timestamp, price] = value;
        if (timestamp > dayTimestamp * 1000) {
          prices[dayTimestamp * 1000] = price;
          dayTimestamp += DAY;
        }
      }
      return [address, prices];
    })
  );

  const prices = {};
  for (const asset in assetPrices) {
    const assetPrice = assetPrices[asset];
    for (const timestamp in assetPrice) {
      const price = assetPrice[timestamp];
      if (!(timestamp in prices)) {
        prices[timestamp] = [];
      }
      prices[timestamp].push(price);
    }
  }
  return prices;
}
