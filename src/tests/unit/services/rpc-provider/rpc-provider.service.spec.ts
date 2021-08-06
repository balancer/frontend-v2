import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import {
  AlchemyProvider,
  JsonRpcProvider,
  WebSocketProvider
} from '@ethersproject/providers';
import { mocked } from 'ts-jest/utils';

let rpcProviderService;

jest.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: jest.fn().mockImplementation(() => {
      return {};
    }),
    WebSocketProvider: jest.fn().mockImplementation(() => {
      return {};
    }),
    AlchemyProvider: jest.fn().mockImplementation(() => {
      return {};
    })
  };
});

describe('RPC provider service', () => {
  const MockedJsonRpcProvider = mocked(JsonRpcProvider, true);
  const MockedWebSocketProvider = mocked(WebSocketProvider, true);
  const MockedAlchemyProvider = mocked(AlchemyProvider, true);

  beforeAll(() => {
    rpcProviderService = new RpcProviderService();
  });

  beforeEach(() => {
    MockedJsonRpcProvider.mockClear();
    MockedWebSocketProvider.mockClear();
    MockedAlchemyProvider.mockClear();
  });

  describe('JSON providers', () => {
    describe('Get default app provider', () => {
      it('Default provider instantiated', () => {
        expect(MockedJsonRpcProvider).toHaveBeenCalledTimes(1);
      });
    });

    // describe('Get JSON provider for network key', () => {
    //   it('Returns instance of JsonRpcProvider for valid network', () => {
    //     const provider = rpcProviderService.getJsonProvider('1');
    //     expect(provider).toBeInstanceOf(JsonRpcProvider);
    //   });

    //   it('Throws error if network not supported', () => {
    //     expect(() => {
    //       rpcProviderService.getJsonProvider('99');
    //     }).toThrow('No config for network key: 99');
    //   });
    // });
  });

  // describe('Websocket providers', () => {
  //   describe('Get default app ws provider', () => {
  //     it('Returns mainnet provider by default', () => {
  //       expect(rpcProviderService.wsProvider).toBeInstanceOf(WebSocketProvider);
  //       expect(rpcProviderService.wsProvider.connection.url).toContain(
  //         'balancer.fi'
  //       );
  //     });
  //   });
  // });

  // describe('Alchemy providers', () => {
  //   describe('Get default app Alchemy provider', () => {
  //     it('Returns mainnet provider by default', () => {
  //       expect(rpcProviderService.alchemyProvider).toBeInstanceOf(
  //         AlchemyProvider
  //       );
  //       expect(rpcProviderService.alchemyProvider.connection.url).toContain(
  //         'mainnet'
  //       );
  //     });
  //   });
  // });
});
