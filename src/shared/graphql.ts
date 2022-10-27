import { StakingDataQuery } from '@/generated/subgraph-gauge-types';
import request from 'graphql-request';

export const v2Subgraph =
  'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2';

export async function queryV2BalancerSubgraph(
  query: string,
  variables?: object
) {
  return request(v2Subgraph, query, variables);
}

export const gaugeSubgraph =
  'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges';

export async function queryGaugeSubgraph(
  query: string,
  variables?: object
): Promise<StakingDataQuery> {
  return request(gaugeSubgraph, query, variables);
}
