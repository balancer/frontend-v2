import {
  defaultGaugeShares,
  defaultPoolGauges,
  defaultPoolId,
  omniEscrowLocksHandler,
  votingEscrowLockHandler,
} from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import gaugesResponse from '@/services/balancer/gauges/__mocks__/gauges-response.schema.json';
import { graphql } from 'msw';
import { mockedTokenPrices } from './token-prices';

export const defaultPoolBalance = '100';

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
        gaugeShares: defaultGaugeShares,
      })
    );
  }),
  graphql.query('Gauges', (req, res, ctx) => {
    return res(ctx.data(gaugesResponse));
  }),
  graphql.query('PoolGauges', (req, res, ctx) => {
    return res(ctx.data(defaultPoolGauges));
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
  votingEscrowLockHandler(),
  omniEscrowLocksHandler(),
];
