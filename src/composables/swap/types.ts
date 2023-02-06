import { BigNumber } from '@ethersproject/bignumber';

export type SwapQuote = {
  feeAmountInToken: string;
  feeAmountOutToken: string;
  maximumInAmount: BigNumber;
  minimumOutAmount: BigNumber;
};
