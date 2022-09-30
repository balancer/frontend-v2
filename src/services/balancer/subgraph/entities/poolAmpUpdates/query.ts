import { merge } from 'lodash';

const defaultAttrs = {
  id: true,
  poolId: {
    id: true,
    symbol: true,
  },
  startTimestamp: true,
  endTimestamp: true,
  startAmp: true,
  endAmp: true,
};

export default (args = {}, attrs = {}) => ({
  ampUpdates: {
    __args: merge({}, {}, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
