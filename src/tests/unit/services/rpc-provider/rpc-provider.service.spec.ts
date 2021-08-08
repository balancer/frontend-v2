import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import {
  AlchemyProvider,
  JsonRpcProvider,
  WebSocketProvider
} from '@ethersproject/providers';
import { mocked } from 'ts-jest/utils';

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

  beforeEach(() => {
    MockedJsonRpcProvider.mockClear();
    MockedWebSocketProvider.mockClear();
    MockedAlchemyProvider.mockClear();
  });

  it('Instantiates the provider service', () => {
    const rpcProviderService = new RpcProviderService();
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    new RpcProviderService();
    expect(JsonRpcProvider).toHaveBeenCalledTimes(1);
  });

  it('Calls the WebSocketProvider constructor', () => {
    new RpcProviderService();
    expect(WebSocketProvider).toHaveBeenCalledTimes(1);
  });

  it('Calls the AlchemyProvider constructor', () => {
    new RpcProviderService();
    expect(AlchemyProvider).toHaveBeenCalledTimes(1);
  });
});
