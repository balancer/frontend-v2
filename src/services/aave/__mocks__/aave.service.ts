export default function AaveService() {
  return {
    calcWeightedSupplyAPRFor: jest.fn().mockImplementation(),
  };
}

export const aaveService = AaveService();
