import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../../generated/balancer-api-types';

//TODO: move this to a config or env var
const API_URL = 'https://test-api.balancer.fi/graphql';

const graphQLClient = new GraphQLClient(API_URL, {
  // You can set the header globally here when you init the client or per request (see below)
  headers: { ChainId: '1' },
});

// getSdk creates a typed client that can be used to fetch data
export const apiClient = getSdk(graphQLClient);

//TODO: this is not the place to do this obviously, its just here to showcase how to use the apiClient
async function getTokenPrices() {
  //This query is generated from the query defined in tokens.graphql
  const { prices } = await apiClient.GetCurrentTokenPrices(
    {},
    {
      // You can set the per request here, depending on your use case
      ChainId: '1',
    }
  );

  // the results are also typed
  const price = prices[0].price; //price is a number
  const address = prices[0].address; //address is a string

  return { price, address };
}

getTokenPrices();

// If you uncomment this code, you'll notice that there are type errors
// Uncomment the GetTokens query in the tokens.graphql file and you should see that the type errors resolve
/*async function getTokens() {
  //This query is generated from the query defined in tokenPrice.graphql
  const { tokens } = await apiClient.GetTokens(
    {},
    {
      // You can set the per request here, depending on your use case
      ChainId: '1',
    }
  );

  tokens[0].address;
  tokens[0].chainId;
  tokens[0].decimals;
  tokens[0].logoURI;
}*/
