import { gql } from 'graphql-request';

export const stakingDataQuery = gql`
  query stakingData {
    liquidityGauges(
      where: { poolAddress: "0x32296969ef14eb0c6d29669c550d4a0449130230" }
    ) {
      id
    }
  }
`;
