import { rest } from 'msw';

export const SANCTIONED_ADDRESS = '0x7f367cc41522ce07553e823bf3be79a889debe1b';

const chainIdHandler = (req, res, ctx) => {
  return req.json().then(data => {
    const MAINNET = '1';
    if (data[0].method === 'eth_chainId') {
      return res(ctx.json([MAINNET]));
    }
    if (data[0].method === 'net_version') {
      return res(ctx.json([MAINNET]));
    }

    console.warn('Unhandled chain id request with payload: ', data);
  });
};

const emptyJsonHandler = (req, res, ctx) => {
  return res(ctx.json({}));
};

export const restHandlers = [
  rest.get('https://cloudflare-ipfs.com/ipfs/xyz', (req, res, ctx) => {
    return res(ctx.text('ipfs test response'));
  }),
  rest.get('https://cloudflare-ipfs.com/ipns/xyz', (req, res, ctx) => {
    return res(ctx.text('ipns test response'));
  }),
  rest.post('*blocklytics/*-blocks', (req, res, ctx) => {
    return res(ctx.json({ data: { blocks: ['12345678'] } }));
  }),
  rest.post('https://mainnet.infura.io/v3/*', chainIdHandler),
  rest.post('https://goerli.infura.io/v3/*', chainIdHandler),
  rest.post('https://eth-goerli.alchemyapi.io/v2/*', chainIdHandler),

  rest.get('https://api.blocknative.com/v0', emptyJsonHandler),

  rest.get(
    'https://api.coingecko.com/api/v3/coins/ethereum/contract/*/market_chart/range',
    (req, res, ctx) => {
      return res(
        ctx.json({
          market_caps: [
            [1666051200000, 0],
            [1665964800000, 0],
          ],
          prices: [
            [1666051200000, 3318.692296009092],
            [1665964800000, 3418.692296009092],
          ],
          total_volumes: [
            [1666051200000, 1262536701.9856105],
            [1665964800000, 54321.1234567],
          ],
        })
      );
    }
  ),

  rest.get(
    'https://api.coingecko.com/api/v3/simple/price*',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),
  rest.get(
    'https://api.coingecko.com/api/v3/simple/token_price/ethereum',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),

  rest.get('https://xxx.balancer.fi/check-wallet', (req, res, ctx) => {
    const query = req.url.searchParams;
    const address = query.get('address');
    if (address === SANCTIONED_ADDRESS)
      return res(ctx.json({ is_blocked: true }));
    // NOT SANCTIONED:
    return res(ctx.json({ is_blocked: false }));
  }),
];
