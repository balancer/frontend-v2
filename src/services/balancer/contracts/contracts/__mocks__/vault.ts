const Vault = vi.fn().mockImplementation(() => {
  return {
    service: {
      provider: vi.fn(),
    },

    instance: {
      getProtocolFeesCollector: vi.fn().mockImplementation(() => {
        return '0x0';
      }),
    },
  };
});

export default Vault;
