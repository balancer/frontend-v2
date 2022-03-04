import { BigNumber } from 'ethers';

export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type AdditionalQueryEntities = Record<
  string,
  {
    __args: QueryArgs;
    [key: string]: any;
  }
>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs,
  additionalEntities?: AdditionalQueryEntities
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
