export const RpcProviderService = () => {
  const RpcProviderService = jest.fn().mockImplementation(() => {
    return {
      _isProvider: true,
      getSigner: () => {
        return {
          _isSigner: true,
          getAddress: jest.fn().mockImplementation(() => {
            return '0x0';
          })
        };
      },
      initBlockListener: jest.fn().mockImplementation()
    };
  });

  return {
    rpcProviderService: new RpcProviderService()
  };
};

// export const rpcProviderService = RpcProviderService();
