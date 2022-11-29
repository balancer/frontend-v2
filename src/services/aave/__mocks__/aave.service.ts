export default function AaveService() {
  return {
    calcWeightedSupplyAPRFor: vi.fn(),
  };
}

export const aaveService = AaveService();
