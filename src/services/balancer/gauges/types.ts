import { BigNumber } from 'ethers';

export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => Record<string, any>;

export type SubgraphGauge = {
  id: string;
  symbol: string;
  pool: string;
  totalSupply: BigNumber;
  factory: {
    id: string;
  };
};
