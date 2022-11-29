export default function LidoService() {
  return {
    getStEthAPR: vi.fn(),
    calcStEthAPRFor: vi.fn(),
  };
}

export const lidoService = LidoService();
