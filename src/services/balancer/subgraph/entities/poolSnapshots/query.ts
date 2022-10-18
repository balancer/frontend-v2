import { merge } from 'lodash';

import { isPolygon } from '@/composables/useNetwork';

const defaultArgs = {
  first: 1000,
};

const defaultAttrs = {
  pool: {
    id: true,
  },
  timestamp: true,
  amounts: true,
  totalShares: true,
  swapVolume: true,
  swapFees: true,
};

if (!isPolygon.value) {
  defaultAttrs['liquidity'] = true;
}

export default (args = {}, attrs = {}) => ({
  poolSnapshots: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
