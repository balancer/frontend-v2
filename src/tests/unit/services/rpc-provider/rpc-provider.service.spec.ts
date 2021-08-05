import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  AlchemyProvider,
  JsonRpcProvider,
  WebSocketProvider
} from '@ethersproject/providers';

describe('RPC provider service', () => {
  describe('JSON providers', () => {
    describe('Get default app provider', () => {
      it('Returns mainnet provider by default', () => {
        expect(rpcProviderService.jsonProvider).toBeInstanceOf(JsonRpcProvider);
        expect(rpcProviderService.jsonProvider.connection.url).toContain(
          'mainnet'
        );
      });
    });

    describe('Get JSON provider for network key', () => {
      it('Returns instance of JsonRpcProvider for valid network', () => {
        const provider = rpcProviderService.getJsonProvider('1');
        expect(provider).toBeInstanceOf(JsonRpcProvider);
      });

      it('Throws error if network not supported', () => {
        expect(() => {
          rpcProviderService.getJsonProvider('99');
        }).toThrow('No config for network key: 99');
      });
    });
  });

  describe('Websocket providers', () => {
    describe('Get default app ws provider', () => {
      it('Returns mainnet provider by default', () => {
        expect(rpcProviderService.wsProvider).toBeInstanceOf(WebSocketProvider);
        expect(rpcProviderService.wsProvider.connection.url).toContain(
          'mockwebsocket'
        );
      });
    });
  });

  describe('Alchemy providers', () => {
    describe('Get default app Alchemy provider', () => {
      it('Returns mainnet provider by default', () => {
        expect(rpcProviderService.alchemyProvider).toBeInstanceOf(
          AlchemyProvider
        );
        expect(rpcProviderService.alchemyProvider.connection.url).toContain(
          'mainnet'
        );
      });
    });
  });
});
