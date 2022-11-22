export const FNumFormats = vi.fn().mockImplementation();

export default function useNumbers() {
  return {
    toFiat: vi.fn().mockImplementation(),
    fNum2: vi.fn().mockImplementation(),
  };
}
