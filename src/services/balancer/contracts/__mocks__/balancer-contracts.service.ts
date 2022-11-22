const BalancerContractsService = vi.fn().mockImplementation(() => {
  return {};
});

export const balancerContractsService = BalancerContractsService();
