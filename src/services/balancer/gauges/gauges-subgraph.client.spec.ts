import gaugesResponse from './__mocks__/gauges-response.schema.json';
import { gaugeQueryBuilder } from './entities/gauges/query';
import { gaugesSubgraphClient } from './gauges-subgraph.client';

describe('GaugesSubgraphClient', () => {
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
