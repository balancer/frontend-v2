import nock from 'nock';

import gaugesResponse from './__mocks__/gauges-response.schema.json';
import { gaugeQueryBuilder } from './entities/gauges/query';
import { gaugesSubgraphClient } from './gauges-subgraph.client';

describe('GaugesSubgraphClient', () => {
  beforeEach(() => {
    nock('https://api.thegraph.com')
      .post('/subgraphs/name/balancer-labs/balancer-gauges-kovan')
      .reply(200, gaugesResponse);
  });

  describe('#get', () => {
    describe('default query', () => {
      it('returns nested data object', async () => {
        const query = gaugeQueryBuilder();
        const response = await gaugesSubgraphClient.get(query);

        expect(response).toEqual(gaugesResponse.data);
      });
    });
  });
});
