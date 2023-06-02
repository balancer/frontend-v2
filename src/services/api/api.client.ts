import { GraphQLClient } from 'graphql-request';
import { getSdk } from './graphql/generated/api-types';
import { configService } from '../config/config.service';
import { VotingGauge } from '@/constants/voting-gauges';

const graphQLClient = new GraphQLClient(configService.env.API_URL, {
  headers: { ChainId: configService.network.chainId.toString() },
});

// getSdk creates a typed client that can be used to fetch data
export const originalApi = getSdk(graphQLClient);

// Fake future api until we implement it
const GetVotingGauges = async (networkId: number): Promise<VotingGauge[]> => {
  console.log('getting voting vauges for networkId: ', networkId);
  return [];
};

export const api = { ...originalApi, ...{ GetVotingGauges } };
