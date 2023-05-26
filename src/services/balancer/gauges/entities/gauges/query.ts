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
  streamer: true,
};

export const gaugeQueryBuilder = (
  args = {},
  attrs = {},
  name: string | undefined = undefined
) => ({
  __name: name,
  liquidityGauges: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
