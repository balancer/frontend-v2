import { gql } from 'graphql-request';

export const stakingDataQuery = gql`
  query stakingData($poolAddress: Bytes) {
    liquidityGauges(where: { poolAddress: $poolAddress }) {
      id
    }
  }
`;
