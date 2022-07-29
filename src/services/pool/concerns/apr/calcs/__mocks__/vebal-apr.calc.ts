export default function VeBalAprCalc() {
  return {
    calc: jest.fn().mockImplementation(),
  };
}

export const veBalAprCalc = VeBalAprCalc();
