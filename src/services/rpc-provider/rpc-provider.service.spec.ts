import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { StaticJsonRpcBatchProvider } from './static-json-rpc-batch-provider';

vi.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: vi.fn().mockImplementation(() => {
      return {};
    }),
    WebSocketProvider: vi.fn().mockImplementation(() => {
      return {
        once: vi.fn(),
      };
    }),
  };
});

vi.mock('./static-json-rpc-batch-provider', () => {
  return {
    StaticJsonRpcBatchProvider: vi.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('RPC provider service', () => {
  const MockedJsonRpcProvider = vi.mocked(JsonRpcProvider, true);
  const MockedStaticJsonRpcBatchProvider = vi.mocked(
    StaticJsonRpcBatchProvider,
    true
  );
  const MockedWebSocketProvider = vi.mocked(WebSocketProvider, true);

  beforeEach(() => {
    MockedJsonRpcProvider.mockClear();
    MockedStaticJsonRpcBatchProvider.mockClear();
    MockedWebSocketProvider.mockClear();
  });

  it('Instantiates the provider service', () => {
    const rpcProviderService = new RpcProviderService();
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    new RpcProviderService();
    expect(MockedStaticJsonRpcBatchProvider).toHaveBeenCalledTimes(1);
  });

  it('Calls the WebSocketProvider', () => {
    new RpcProviderService().initBlockListener(() => ({}));
    expect(WebSocketProvider).toHaveBeenCalledTimes(1);
  });
});
