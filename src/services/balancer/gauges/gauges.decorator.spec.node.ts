import { AddressZero } from '@ethersproject/constants';
import { gaugesSubgraphService } from './gauges-subgraph.service';
import { gaugesDecorator } from './gauges.decorator';
import decoratedGaugeSchema from './__mocks__/decorated-gauge.schema.json';
import gaugesResponse from './__mocks__/gauges-response.schema.json';
import { WebSocketProvider } from '@ethersproject/providers';
import nock from 'nock';

jest.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: jest.requireActual('@ethersproject/providers')
      .JsonRpcProvider,
    WebSocketProvider: jest.fn().mockImplementation(() => {
      return {};
    })
  };
});

// jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('GaugesDecorator', () => {
  const MockedWebSocketProvider = jest.mocked(WebSocketProvider, true);

  beforeEach(() => {
    MockedWebSocketProvider.mockClear();

    nock('https://api.thegraph.com')
      .post('/subgraphs/name/mendesfabio/balancer-gauges')
      .reply(200, gaugesResponse);

    nock('https://kovan.infura.io/v3/f4b7c65997354c3783277ae1644ebdfd')
      .get('')
      .reply(200);
  });

  describe('#decorate', () => {
    it('Returns merged subgraph + onchain schema', async () => {
      const subgraphGauges = await gaugesSubgraphService.gauges.get();
      const gauges = await gaugesDecorator.decorate(
        subgraphGauges,
        AddressZero
      );

      expect(Object.keys(gauges[0])).toEqual(Object.keys(decoratedGaugeSchema));
    });
  });
});
