export const FNumFormats = jest.fn().mockImplementation();

export default function useNumbers() {
  return {
    toFiat: jest.fn().mockImplementation(),
    fNum2: jest.fn().mockImplementation(),
  };
}
