export default function VaultService() {
  return {
    swap: vi.fn(),
    batchSwap: vi.fn(),
  };
}

export const vaultService = VaultService();
