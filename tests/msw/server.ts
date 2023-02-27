import { setupServer } from 'msw/node';
import { restHandlers } from './rest-handlers';
import { graphqlHandlers } from './graphql-handlers';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...graphqlHandlers, ...restHandlers);
