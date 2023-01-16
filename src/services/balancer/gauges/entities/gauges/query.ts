import { merge } from 'lodash';

const defaultArgs = {
  first: 999,
};

const defaultAttrs = {
  id: true,
  symbol: true,
  poolId: true,
  totalSupply: true,
  isKilled: true,
  factory: {
    id: true,
  },
  isPreferentialGauge: true,
};

export const gaugeQueryBuilder = (args = {}, attrs = {}) => ({
  __name: 'LiquidityGaugesQuery',
  liquidityGauges: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
