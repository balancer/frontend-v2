import GaugesResponse from '@/services/balancer/gauges/__mocks__/gauges-response.schema.json';

import { LiquidityGauge } from './liquidity-gauge';

jest.mock('@/services/web3/web3.service');
jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('Balancer', () => {
  it('Instantiates the class', () => {
    const gauge = GaugesResponse.data.liquidityGauges[0];
    const liquidityGauge = new LiquidityGauge(gauge.id);
    expect(liquidityGauge).toBeTruthy();
  });
});
