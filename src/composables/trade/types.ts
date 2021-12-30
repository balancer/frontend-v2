import { BigNumber } from '@ethersproject/bignumber';

export type TradeQuote = {
  feeAmountInToken: string;
  feeAmountOutToken: string;
  maximumInAmount: BigNumber;
  minimumOutAmount: BigNumber;
};
