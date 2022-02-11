import { gaugeQueryBuilder } from './entities/gauges/query';
import { gaugesSubgraphClient } from './gauges-subgraph.client';
import gaugesSchema from './__mocks__/gauges.schema.json';
import nock from 'nock';

describe('GaugesSubgraphClient', () => {
  beforeEach(() => {
    nock('https://api.thegraph.com')
      .post('/subgraphs/name/mendesfabio/balancer-gauges')
      .reply(200, { data: gaugesSchema.many });
  });

  describe('#get', () => {
    it('returns array of gauges when called with default query', async () => {
      const query = gaugeQueryBuilder();
      const response = await gaugesSubgraphClient.get(query);

      expect(response).toEqual(gaugesSchema.many);
    });
  });
});
