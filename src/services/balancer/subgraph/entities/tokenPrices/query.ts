import { merge } from 'lodash';

const defaultAttrs = {
  id: true,
  asset: true,
  amount: true,
  pricingAsset: true,
  price: true,
  block: true,
  timestamp: true,
  poolId: {
    id: true
  }
};

export default (args = {}, attrs = {}) => ({
  tokenPrices: {
    __args: args,
    ...merge({}, defaultAttrs, attrs)
  }
});
