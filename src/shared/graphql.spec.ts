import { StakingDataQueryVariables } from '@/generated/subgraph-gauge-types';
import { stakingDataQuery } from '@/providers/local/staking/staking.graphql';
import { queryGaugeSubgraph } from './graphql';

test('TODO: integration test that should be mocked by msw (check MSW warnings when running this test)', async () => {
  const result = await queryGaugeSubgraph(stakingDataQuery, {
    poolAddress: '0xcd4722b7c24c29e0413bdcd9e51404b4539d14ae',
  } as StakingDataQueryVariables);

  expect(result.liquidityGauges[0].id).toBe(
    '0xcd4722b7c24c29e0413bdcd9e51404b4539d14ae'
  );
});
