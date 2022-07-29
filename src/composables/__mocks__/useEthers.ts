export default function useEthers() {
  return {
    txListener: jest.fn().mockImplementation(),
  };
}
