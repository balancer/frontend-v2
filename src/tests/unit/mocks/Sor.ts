import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { BigNumber } from 'bignumber.js';

export const MockSorReturn = () => {
  const sorReturn: SorReturn = {
    isV1swap: false,
    isV1best: false,
    hasSwaps: false,
    tokenIn: '',
    tokenOut: '',
    returnDecimals: 18,
    returnAmount: new BigNumber(0),
    marketSpNormalised: new BigNumber(0),
    v1result: [[], new BigNumber(0), new BigNumber(0)],
    v2result: {
      tokenAddresses: [],
      swaps: [],
      swapAmount: new BigNumber(0),
      returnAmount: new BigNumber(0),
      returnAmountConsideringFees: new BigNumber(0),
      tokenIn: '',
      tokenOut: '',
      marketSp: new BigNumber(0)
    }
  };

  return sorReturn;
};
