import { isPolygon } from '@/composables/useNetwork';
import { merge } from 'lodash';

const defaultAttrs = {
  pool: {
    id: true
  },
  timestamp: true,
  amounts: true,
  totalShares: true,
  swapVolume: true,
  swapFees: true
};

if (!isPolygon) {
  defaultAttrs['liquidity'] = true;
}

export default (args = {}, attrs = {}) => ({
  poolSnapshot: {
    __args: args,
    ...merge({}, defaultAttrs, attrs)
  }
});
