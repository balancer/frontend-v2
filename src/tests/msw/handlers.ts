import { rest } from 'msw';
import gaugesResponse from '../../services/balancer/gauges/__mocks__/gauges-response.schema.json';

export const SANCTIONED_ADDRESS = '0x7f367cc41522ce07553e823bf3be79a889debe1b';

const chainIdHandler = (req, res, ctx) => {
  return req.json().then(data => {
    if (data[0].method === 'eth_chainId') {
      const MAINNET = '1';
      return res(ctx.json([MAINNET]));
    }
    console.log('Unhandled post with payload: ', data);
  });
};

export const handlers = [
  rest.get('https://cloudflare-ipfs.com/ipfs/xyz', (req, res, ctx) => {
    return res(ctx.text('ipfs test response'));
  }),
  rest.get('https://cloudflare-ipfs.com/ipns/xyz', (req, res, ctx) => {
    return res(ctx.text('ipns test response'));
  }),
  rest.post('*blocklytics/*-blocks', (req, res, ctx) => {
    return res(ctx.json({ data: { blocks: ['12345678'] } }));
  }),
  rest.post('*/balancer-labs/balancer-gauges*', (req, res, ctx) => {
    return req.json().then(data => {
      if (data.query.startsWith('query { liquidityGauges')) {
        return res(ctx.json(gaugesResponse));
      }
      console.log('Unhandled gauge request with payload: ', data);
    });
  }),

  rest.post('https://mainnet.infura.io/v3/*', chainIdHandler),

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

  rest.post('https://api.balancer.fi/wallet-check', (req, res, ctx) => {
    return req.json().then(data => {
      if (data.address === SANCTIONED_ADDRESS)
        return res(ctx.json({ is_blocked: true }));
      // NOT SANCTIONED:
      return res(ctx.json({ is_blocked: false }));
    });
  }),
];
