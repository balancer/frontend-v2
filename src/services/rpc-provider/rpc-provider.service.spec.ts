import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

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
  const MockedJsonRpcProvider = jest.mocked(JsonRpcProvider, true);
  const MockedWebSocketProvider = jest.mocked(WebSocketProvider, true);

  beforeEach(() => {
    MockedJsonRpcProvider.mockClear();
    MockedWebSocketProvider.mockClear();
  });

  it('Instantiates the provider service', () => {
    const rpcProviderService = new RpcProviderService();
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    new RpcProviderService();
    // Expect 2 calls since logging provider is also a JSON provider
    expect(JsonRpcProvider).toHaveBeenCalledTimes(2);
  });

  it('Calls the WebSocketProvider constructor', () => {
    new RpcProviderService();
    expect(WebSocketProvider).toHaveBeenCalledTimes(1);
  });
});
