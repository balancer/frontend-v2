import { server } from '@tests/msw/server';
import { rest } from 'msw';
import ArbitrumProvider from './arbitrum.provider';

const defaultGasResponse = { jsonrpc: '2.0', id: 1, result: '0x5f5e100' };
const defaultMaxPriorityFeeResponse = { jsonrpc: '2.0', id: 1, result: '0x0' };

describe('Arbitrum Provider', () => {
  const arbitrumProvider = new ArbitrumProvider();

  beforeEach(() => {
    server.use(
      rest.post(
        'https://arb-mainnet.g.alchemy.com/v2/VBeQgTCRqqPtuuEPsFzRdwKXzDyN6aFh',
        (req, res, ctx) => {
          return req.json().then(data => {
            if (data.method === 'eth_gasPrice')
              return res(ctx.json(defaultGasResponse));
            if (data.method === 'eth_maxPriorityFeePerGas')
              return res(ctx.json(defaultMaxPriorityFeeResponse));
          });
        }
      )
    );
  });

  it('Should return processed gas values', async () => {
    const response = await arbitrumProvider.getGasPrice();
    expect(response?.price).toEqual(100000000);
    expect(response?.maxPriorityFeePerGas).toEqual(0);
  });
});
