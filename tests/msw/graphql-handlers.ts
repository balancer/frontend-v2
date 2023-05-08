import { graphql } from 'msw';
import gaugesResponse from '@/services/balancer/gauges/__mocks__/gauges-response.schema.json';
import { mockedTokenPrices } from './token-prices';

export const defaultPoolId =
  '0xe053685f16968a350c8dea6420281a41f72ce3aa00020000000000000000006b';
export const defaultPoolBalance = '100';
export const defaultGaugeBalance = '50';
export const defaultTotalSupply = '10000';

export const graphqlHandlers = [
  graphql.query('Pools', (req, res, ctx) => {
    return res(ctx.data({ foo: 'bar' }));
  }),

  graphql.query('PoolShares', (req, res, ctx) => {
    return res(
      ctx.data({
        poolShares: [
          {
            poolId: { id: defaultPoolId },
            balance: defaultPoolBalance,
          },
        ],
      })
    );
  }),

  graphql.query('GaugeShares', (req, res, ctx) => {
    return res(
      ctx.data({
        gaugeShares: [
          {
            balance: defaultGaugeBalance,
            gauge: {
              id: 'gauge id',
              poolId: defaultPoolId,
              totalSupply: defaultTotalSupply,
            },
          },
        ],
      })
    );
  }),
  graphql.query('Gauges', (req, res, ctx) => {
    return res(ctx.data(gaugesResponse));
  }),
  graphql.query('AllPools', (req, res, ctx) => {
    return res(ctx.data([]));
  }),

  graphql.query('GetCurrentTokenPrices', (req, res, ctx) => {
    return res(
      ctx.data({
        prices: mockedTokenPrices,
      })
    );
  }),
];
