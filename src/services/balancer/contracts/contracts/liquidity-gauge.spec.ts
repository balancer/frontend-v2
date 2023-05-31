import GaugesResponse from '@/services/balancer/gauges/__mocks__/gauges-response.schema.json';

import { LiquidityGauge } from './liquidity-gauge';
import { initEthersContractWithDefaultMocks } from '@/dependencies/EthersContract.mocks';

initEthersContractWithDefaultMocks();

describe('Balancer', () => {
  it('Instantiates the class', () => {
    const gauge = GaugesResponse.liquidityGauges[0];
    const liquidityGauge = new LiquidityGauge(gauge.id);
    expect(liquidityGauge).toBeTruthy();
  });
});
