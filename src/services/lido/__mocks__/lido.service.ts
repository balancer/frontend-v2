export default function LidoService() {
  return {
    getStEthAPR: vi.fn().mockImplementation(),
    calcStEthAPRFor: vi.fn().mockImplementation(),
  };
}

export const lidoService = LidoService();
