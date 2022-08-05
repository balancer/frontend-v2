export default function LidoService() {
  return {
    getStEthAPR: jest.fn().mockImplementation(),
    calcStEthAPRFor: jest.fn().mockImplementation(),
  };
}

export const lidoService = LidoService();
