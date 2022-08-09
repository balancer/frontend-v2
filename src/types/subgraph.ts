import { GraphQLQuery } from '@balancer-labs/sdk';

export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => Record<string, any>;
export type PoolsQueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => GraphQLQuery;
