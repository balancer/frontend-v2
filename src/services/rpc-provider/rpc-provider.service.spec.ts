import {
  JsonRpcBatchProvider,
  JsonRpcProvider,
  WebSocketProvider,
} from '@ethersproject/providers';

import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';

jest.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: jest.fn().mockImplementation(() => {
      return {};
    }),
    JsonRpcBatchProvider: jest.fn().mockImplementation(() => {
      return {};
    }),
    WebSocketProvider: jest.fn().mockImplementation(() => {
      return {
        once: jest.fn().mockImplementation(),
      };
    }),
  };
});

describe('RPC provider service', () => {
  const MockedJsonRpcProvider = jest.mocked(JsonRpcProvider, true);
  const MockedJsonRpcBatchProvider = jest.mocked(JsonRpcBatchProvider, true);
  const MockedWebSocketProvider = jest.mocked(WebSocketProvider, true);

  beforeEach(() => {
    MockedJsonRpcProvider.mockClear();
    MockedJsonRpcBatchProvider.mockClear();
    MockedWebSocketProvider.mockClear();
  });

  it('Instantiates the provider service', () => {
    const rpcProviderService = new RpcProviderService();
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    new RpcProviderService();
    // Expect 2 calls since logging provider is also a JSON provider
    expect(JsonRpcBatchProvider).toHaveBeenCalledTimes(2);
  });

  it('Calls the WebSocketProvider', () => {
    new RpcProviderService().initBlockListener(() => ({}));
    expect(WebSocketProvider).toHaveBeenCalledTimes(1);
  });
});
