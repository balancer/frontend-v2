export default function LidoRelayerService() {
  return {
    swap: vi.fn().mockImplementation(),
    batchSwap: vi.fn().mockImplementation(),
  };
}

export const lidoRelayerService = LidoRelayerService();
