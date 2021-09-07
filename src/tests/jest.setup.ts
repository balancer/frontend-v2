// NOTE: reflect-metadata must be defined as the first import in order for TypeDI to function correctly
import 'reflect-metadata';
import nock from 'nock';

/**
 * HTTP Requests
 *
 * We should not allow external http requests from tests
 * All http requests should be mocked with expected responses
 * See nock docs for details: https://github.com/nock/nock
 */
nock.disableNetConnect();
// Enable for mocked websockets
nock.enableNetConnect('balancer.fi');
