function getChainAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    1: {},
    42: {
      '0xb5399358fa9744c604f8fae7043a547f74206d4c':
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x3994596ad2114bc369e3e542abee9bc3d2c071b1':
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0x16c6a736b28d92aae496bb30f937826798afc63c':
        '0xba100000625a3754423978a60c9317c58a424e3d',
      '0xfa06b7b5e149e575b457e595c606ec58b17e9e13':
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0xff7f80466430289049c9325f88af5646ae93e5a7':
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
      42: '0xB5399358Fa9744c604F8faE7043a547F74206D4C'
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      42: '0x3994596aD2114BC369E3e542ABeE9bC3D2c071b1'
    },
    '0xba100000625a3754423978a60c9317c58a424e3d': {
      42: '0x16c6A736B28d92aae496bB30f937826798AfC63C'
    },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      42: '0xfA06B7B5e149e575B457e595c606ec58B17e9e13'
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      42: '0xFf7F80466430289049c9325F88Af5646ae93e5A7'
    }
  };
  if (!map[address] || !map[address][chainId]) {
    return address;
  }
  return map[address][chainId];
}

export async function getTokensPrice(chainId, addresses) {
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

export async function getTokensHistoricalPrice(chainId, addresses, days) {
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

export async function getEtherPrice() {
  const uri =
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true';
  const result = await fetch(uri).then(res => res.json());
  return {
    price: result.ethereum.usd,
    price24HChange: result.ethereum.usd_24h_change
  };
}

export async function getMarketChart(address, days = 7) {
  const uri = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart/?vs_currency=usd&days=${days}`;
  const result = await fetch(uri).then(res => res.json());
  return result.prices;
}

export async function getDailyMarketChart(address, days = 7) {
  const dailyMarketChart = {};
  const marketChart = await getMarketChart(address, days);
  marketChart.forEach(p => {
    const date = new Date();
    date.setTime(p[0]);
    const day = date.toISOString().split('T')[0];
    dailyMarketChart[day] = p[1];
  });
  return Object.entries(dailyMarketChart);
}
