const RpcProviderService = {
  default: vi.fn().mockImplementation(() => {
    return {
      _isProvider: true,
      getSigner: () => {
        return {
          _isSigner: true,
          getAddress: vi.fn().mockImplementation(() => {
            return '0x0';
          }),
        };
      },
      initBlockListener: vi.fn(),
      getJsonProvider: vi.fn(),
    };
  }),
};
export const rpcProviderService = RpcProviderService.default();
