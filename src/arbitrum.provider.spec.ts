import { server } from '@/tests/msw/server';
import { rest } from 'msw';
import { fetchArbitrumProvider } from './arbitrum.provider';

const defaultGasResponse = { jsonrpc: '2.0', id: 1, result: '0x5f5e100' };
const defaultMaxPriorityFeeResponse = { jsonrpc: '2.0', id: 1, result: '0x0' };

describe('Arbitrum Provider', () => {

  beforeEach(() => {
    server.use(
      rest.post('https://arbitrum-mainnet.infura.io/v3/*', (req, res, ctx) => {
            return res(ctx.json({}));
      })
    );
  });

  it('Should return processed gas values', async () => {
    const response = await fetchArbitrumProvider('eth_gasPrice')
    expect(response).toBeInstanceOf(Object);
  });
});
