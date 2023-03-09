import { GraphQLClient } from 'graphql-request';
import { getSdk } from './graphql/generated/api-types';
import { configService } from '../config/config.service';

const graphQLClient = new GraphQLClient(configService.env.API_URL, {
  headers: { ChainId: configService.network.chainId.toString() },
});

// getSdk creates a typed client that can be used to fetch data
export const api = getSdk(graphQLClient);
