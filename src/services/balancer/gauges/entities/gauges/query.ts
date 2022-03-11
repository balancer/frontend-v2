import { merge } from 'lodash';

const defaultArgs = {
  first: 20
};

const defaultAttrs = {
  id: true,
  symbol: true,
  poolId: true,
  totalSupply: true,
  factory: {
    id: true
  }
};

export const gaugeQueryBuilder = (args = {}, attrs = {}) => ({
  liquidityGauges: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
