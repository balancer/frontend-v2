import {
  QueryStakingDataQuery,
  QueryStakingDataQueryVariables,
  QueryStakingEligibleQuery,
  QueryStakingEligibleQueryVariables,
} from '@/generated/subgraph-gauge-types';
import {
  stakingDataQuery,
  stakingEligibleQuery,
} from '@/providers/local/staking/staking.graphql';
import { queryGaugeSubgraph } from './graphql';

test('TODO: integration test that should be mocked by msw (check MSW warnings when running this test)', async () => {
  const result: QueryStakingEligibleQuery = await queryGaugeSubgraph(
    stakingEligibleQuery,
    {
      poolAddress: '0x32296969ef14eb0c6d29669c550d4a0449130230',
    } as QueryStakingEligibleQueryVariables
  );

  expect(result.liquidityGauges[0].id).toBe(
    '0xcd4722b7c24c29e0413bdcd9e51404b4539d14ae'
  );
});

test('TODO: integration test that should be mocked by msw (check MSW warnings when running this test)2', async () => {
  const result: QueryStakingDataQuery = await queryGaugeSubgraph(
    stakingDataQuery,
    {
      user: '0x1c39babd4e0d7bff33bc27c6cc5a4f1d74c9f562',
      poolId_in: [],
    } as QueryStakingDataQueryVariables
  );

  expect(result.gaugeShares).toEqual([]);
});
