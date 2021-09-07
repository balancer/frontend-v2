import { Container } from 'typedi';
import { RpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';
import { mocked } from 'ts-jest/utils';

jest.mock('@ethersproject/providers', () => {
  return {
    JsonRpcProvider: jest.fn().mockImplementation(() => {
      return { json: true };
    }),
    WebSocketProvider: jest.fn().mockImplementation(() => {
      return { ws: true };
    })
  };
});

describe('RPC provider service', () => {
  const MockedJsonRpcProvider = mocked(JsonRpcProvider, true);
  const MockedWebSocketProvider = mocked(WebSocketProvider, true);

  beforeEach(() => {
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
