import nock from 'nock';
import '@testing-library/jest-dom';
import { config } from '@vue/test-utils';
import translations from '@/locales/default.json';

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

/**
 * Global template mocks
 */
config.global.mocks = {
  $t: msg => translations[msg]
};
