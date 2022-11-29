export const FNumFormats = vi.fn();

export default function useNumbers() {
  return {
    toFiat: vi.fn(),
    fNum2: vi.fn(),
  };
}
