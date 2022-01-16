import { isPolygon } from '@/composables/useNetwork';
import { merge } from 'lodash';

const defaultArgs = {
  subgraphError: 'allow'
};

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
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
