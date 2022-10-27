import { gql } from 'graphql-request';

// staking.provider line 145
export const stakingEligibleQuery = gql`
  query queryStakingEligible($poolAddress: Bytes) {
    liquidityGauges(where: { poolAddress: $poolAddress }) {
      id
    }
  }
`;

// userStakingData line 129
export const stakingDataQuery = gql`
  query queryStakingData($user: String, $poolId_in: [Bytes!]) {
    gaugeShares(where: { user: $user, balance_gt: "0" }) {
      balance
      gauge {
        id
        poolId
        totalSupply
      }
    }
    liquidityGauges(where: { poolId_in: $poolId_in }) {
      poolId
    }
  }
`;
