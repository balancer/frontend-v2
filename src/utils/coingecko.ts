function getChainAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    1: {},
    42: {
      '0xd0A1E359811322d97991E03f863a0C30C2cF029C':
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x1528F3FCc26d13F7079325Fb78D9442607781c8C':
        '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xef13C0c8abcaf5767160018d268f9697aE4f5375':
        '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5':
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x8c9e6c40d3402480ACE624730524fACC5482798c':
        '0x221657776846890989a759ba2973e427dff5c9bb',
      '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb':
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE':
        '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
      '0x86436BcE20258a6DcfE48C9512d4d49A30C4d8c4':
        '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
      '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9':
        '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
      '0xccb0F4Cf5D3F97f4a55bb5f5cA321C3ED033f244':
        '0xe41d2489571d322189246dafa5ebde1f4699f498'
    }
  };
  return map[chainId][address] || address;
}

function getOriginalAddress(chainId: number, address: string) {
  if (!address) {
    return;
  }
  const map = {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      42: '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      42: '0x1528F3FCc26d13F7079325Fb78D9442607781c8C'
    },
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
      42: '0xef13C0c8abcaf5767160018d268f9697aE4f5375'
    },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      42: '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5'
    },
    '0x221657776846890989a759ba2973e427dff5c9bb': {
      42: '0x8c9e6c40d3402480ACE624730524fACC5482798c'
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      42: '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb'
    },
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': {
      42: '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE'
    },
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': {
      42: '0x86436BcE20258a6DcfE48C9512d4d49A30C4d8c4'
    },
    '0xa117000000f279d81a1d3cc75430faa017fa5a2e': {
      42: '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9'
    },
    '0xe41d2489571d322189246dafa5ebde1f4699f498': {
      42: '0xccb0F4Cf5D3F97f4a55bb5f5cA321C3ED033f244'
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
