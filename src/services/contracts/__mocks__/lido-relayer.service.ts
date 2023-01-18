export default function LidoRelayerService() {
  return {
    swap: vi.fn(),
    batchSwap: vi.fn(),
  };
}

export const lidoRelayerService = LidoRelayerService();
