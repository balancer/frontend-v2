export default function Web3Service() {
  return {
    sendTransaction: jest.fn().mockImplementation()
  };
}

export const web3Service = Web3Service();