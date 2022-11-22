export default function VaultService() {
  return {
    swap: vi.fn().mockImplementation(),
    batchSwap: vi.fn().mockImplementation(),
  };
}

export const vaultService = VaultService();
