export async function getTokensPrice(addresses) {
  const max = 175;
  const pages = Math.ceil(addresses.length / max);
  const promises = [];
  Array.from(Array(pages)).forEach((x, i) => {
    const addressesStr = addresses.slice(max * i, max * (i + 1));
    const uri = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addressesStr}&vs_currencies=usd&include_24hr_change=true`;
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
      token[0],
      {
        price: token[1].usd,
        price24HChange: token[1].usd_24h_change
      }
    ])
  );
}
