export default function VeBalAprCalc() {
  return {
    calc: vi.fn().mockImplementation(),
  };
}

export const veBalAprCalc = VeBalAprCalc();
