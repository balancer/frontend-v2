import nock from 'nock';

/**
 * HTTP Requests
 *
 * We should not allow external http requests from tests
 * All http requests should be mocked with expected responses
 * See nock docs for details: https://github.com/nock/nock
 */
nock.disableNetConnect();
// Catch all websocket requests
nock(/mockwebsocket/)
  .get('/')
  .reply(200);
