import gaugesResponse from './__mocks__/gauges-response.schema.json';
import { gaugesSubgraphService } from './gauges-subgraph.service';

describe('GaugesSubgraphService', () => {
  describe('#get', () => {
    describe('default query', () => {
      it('Array of gauges', async () => {
        const response = await gaugesSubgraphService.gauges.get();

        expect(response).toEqual(gaugesResponse.data.liquidityGauges);
      });
    });
  });
});
