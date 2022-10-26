import { PoolMock } from '@/__mocks__/pool';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';

import { AprConcern } from './apr.concern';

jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/lido/lido.service');
jest.mock('@/services/aave/aave.service');
jest.mock('./calcs/vebal-apr.calc');
jest.mock('@/composables/useNumbers');

const poolSnapshot = { ...PoolMock };
const calcParams = {
  poolSnapshot,
  prices: {},
  currency: FiatCurrency.usd,
  protocolFeePercentage: 0.5,
  stakingBalApr: { max: '0', min: '0' },
  stakingRewardApr: '0',
};

describe('AprConcern', () => {
  it('Instantiates the class', () => {
    const aprConcern = new AprConcern(PoolMock);
    expect(aprConcern).toBeTruthy();
  });

  it('Returns swap fee APR of 1%', async () => {
    // Set input params that should result in 1% swap fee APR
    PoolMock.totalLiquidity = bnum(100_000_000).toString();
    PoolMock.totalSwapFee = bnum(10_000_000).toString();
    calcParams.poolSnapshot.totalSwapFee = bnum(PoolMock.totalSwapFee)
      .minus(5480)
      .toString();

    const aprConcern = new AprConcern(PoolMock);

    const aprs = await aprConcern.calc(
      calcParams.poolSnapshot,
      calcParams.prices,
      calcParams.currency,
      calcParams.protocolFeePercentage,
      calcParams.stakingBalApr,
      calcParams.stakingRewardApr
    );

    expect(bnum(aprs.swap).toFixed(2)).toEqual('0.01');
  });

  it('Returns correct % if boost provided', async () => {
    calcParams.stakingBalApr = { min: '0.01', max: '0.03' };

    const aprConcern = new AprConcern(PoolMock);

    const aprs = await aprConcern.calc(
      calcParams.poolSnapshot,
      calcParams.prices,
      calcParams.currency,
      calcParams.protocolFeePercentage,
      calcParams.stakingBalApr,
      calcParams.stakingRewardApr
    );

    expect(bnum(aprs.total.staked.calc('2.5')).toFixed(3)).toEqual('0.035');
    expect(bnum(aprs.total.staked.calc('1.5')).toFixed(3)).toEqual('0.025');
    expect(bnum(aprs.total.staked.calc('1')).toFixed(3)).toEqual('0.020');
  });
});
