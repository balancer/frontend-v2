export default function LidoRelayerService() {
  return {
    swap: jest.fn().mockImplementation(),
    batchSwap: jest.fn().mockImplementation(),
  };
}

export const lidoRelayerService = LidoRelayerService();
