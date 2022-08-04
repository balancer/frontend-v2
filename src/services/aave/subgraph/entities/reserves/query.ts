import { merge } from 'lodash';

const defaultArgs = {};

const defaultAttrs = {
  name: true,
  underlyingAsset: true,

  liquidityRate: true,
  stableBorrowRate: true,
  variableBorrowRate: true,

  aEmissionPerSecond: true,
  vEmissionPerSecond: true,
  sEmissionPerSecond: true,

  totalATokenSupply: true,
  totalCurrentVariableDebt: true,

  price: {
    priceInEth: true,
  },

  aToken: {
    underlyingAssetAddress: true,
  },
};

export default (args = {}, attrs = {}) => ({
  reserves: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
