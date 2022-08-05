export default function VaultService() {
  return {
    swap: jest.fn().mockImplementation(),
    batchSwap: jest.fn().mockImplementation(),
  };
}

export const vaultService = VaultService();
