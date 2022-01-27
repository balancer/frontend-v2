const BalancerContractsService = jest.fn().mockImplementation(() => {
  return {};
});

export const balancerContractsService = BalancerContractsService();
