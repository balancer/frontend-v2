const Vault = jest.fn().mockImplementation(() => {
  return {
    service: {
      provider: jest.fn(),
    },

    instance: {
      getProtocolFeesCollector: jest.fn().mockImplementation(() => {
        return '0x0';
      }),
    },
  };
});

export default Vault;
