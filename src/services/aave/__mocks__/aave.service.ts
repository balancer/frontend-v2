export default function AaveService() {
  return {
    calcWeightedSupplyAPRFor: vi.fn().mockImplementation(),
  };
}

export const aaveService = AaveService();
