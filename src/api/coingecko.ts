function getChainAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    1: {},
    42: {
      '0xe1329748c41A140536e41049C95c36A53bCACee6':
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x7a0fbc1ad60e8d624215282afb0e877e51a08136':
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0x1688c45bc51faa1b783d274e03da0a0b28a0a871':
        '0xba100000625a3754423978a60c9317c58a424e3d',
      '0x5468c3a3e32e390c6fef5e3622a616695b501900':
        '0xbc396689893d065f41bc2c6ecbee5e0085233447',
      '0xd9d9e09604c0c14b592e6e383582291b026ebced':
        '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      '0xfd05bbf0e4e2fc552a67f3cb2dd2ecb289252ee1':
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x59935f19d720ad935becdc34c4f367397a28daed':
        '0x6b175474e89094c44da98b954eedeac495271d0f'
    }
  };
  return map[chainId][address.toLowerCase()] || address;
}

function getOriginalAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      42: '0xe1329748c41a140536e41049c95c36a53bcacee6'
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      42: '0x7a0fbc1ad60e8d624215282afb0e877e51a08136'
    },
    '0xba100000625a3754423978a60c9317c58a424e3d': {
      42: '0x1688c45bc51faa1b783d274e03da0a0b28a0a871'
    },
    '0xbc396689893d065f41bc2c6ecbee5e0085233447': {
      42: '0x5468c3a3e32e390c6fef5e3622a616695b501900'
    },
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
      42: '0xd9d9e09604c0c14b592e6e383582291b026ebced'
    },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      42: '0xfd05bbf0e4e2fc552a67f3cb2dd2ecb289252ee1'
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      42: '0x59935f19d720ad935becdc34c4f367397a28daed'
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

type HistoricalPrices = Record<string, Prices>;

export async function getEtherPrice(): Promise<Price> {
  const uri =
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true';
  const result = await fetch(uri).then(res => res.json());
  return {
    price: result.ethereum.usd,
    price24HChange: result.ethereum.usd_24h_change
  };
}

export async function getTokensPrice(
  chainId: number,
  addresses: string[]
): Promise<Prices> {
  const max = 175;
  const pages = Math.ceil(addresses.length / max);
  const promises = [];
  Array.from(Array(pages)).forEach((x, i) => {
    const addressString = addresses
      .slice(max * i, max * (i + 1))
      .map(address => getChainAddress(chainId, address));
    const uri = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addressString}&vs_currencies=usd&include_24hr_change=true`;
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
  const DAY = 60 * 60 * 24;
  const now = Math.floor(Date.now() / 1000);
  const end = now - (now % DAY);
  const start = end - days * DAY;
  const priceRequests = addresses.map(address => {
    const chainAddress = getChainAddress(chainId, address);
    const url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${chainAddress}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`;
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
