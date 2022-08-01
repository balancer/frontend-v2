const RpcProviderService = jest.fn().mockImplementation(() => {
  return {
    _isProvider: true,
    getSigner: () => {
      return {
        _isSigner: true,
        getAddress: jest.fn().mockImplementation(() => {
          return '0x0';
        }),
      };
    },
    initBlockListener: jest.fn().mockImplementation(),
    getJsonProvider: jest.fn().mockImplementation(),
  };
});

export const rpcProviderService = RpcProviderService();
