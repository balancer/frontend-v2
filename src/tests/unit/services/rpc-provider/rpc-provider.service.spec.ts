import { Container } from 'typedi';
import { RpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';
import { mocked } from 'ts-jest/utils';

jest.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: jest.fn().mockImplementation(() => {
      return {};
    }),
    WebSocketProvider: jest.fn().mockImplementation(() => {
      return {};
    })
  };
});

describe('RPC provider service', () => {
  const MockedJsonRpcProvider = mocked(JsonRpcProvider, true);
  const MockedWebSocketProvider = mocked(WebSocketProvider, true);

  beforeEach(() => {
    // Explicitly reset Container each test case to allow for instantiating the service multiple times
    // TODO: if we were to implement TypeDI we should come up with a uniform approach of testing these services
    Container.reset();
    MockedJsonRpcProvider.mockClear();
    MockedWebSocketProvider.mockClear();
  });

  it('Gets the instantiated provider service', () => {
    const rpcProviderService = Container.get(RpcProviderService);
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    Container.get(RpcProviderService);
    // Expect 2 calls since logging provider is also a JSON provider
    expect(JsonRpcProvider).toHaveBeenCalledTimes(2);
  });

  it('Calls the WebSocketProvider constructor', () => {
    Container.get(RpcProviderService);
    expect(WebSocketProvider).toHaveBeenCalledTimes(1);
  });
});
