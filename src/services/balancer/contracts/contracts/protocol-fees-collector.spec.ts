import { noop } from 'lodash';
import { balancerContractsService } from '../balancer-contracts.service';
import ProtocolFeesCollector from './protocol-fees-collector';
import Vault from './vault';

vi.mock('../balancer-contracts.service');
vi.mock('./vault');

vi.mock('ethers', () => {
  return {
    Contract: vi.fn().mockImplementation(() => {
      return {
        getSwapFeePercentage: vi.fn().mockImplementation(() => {
          return '100000000000000000'; // 10%
        }),
      };
    }),
  };
});

describe('ProtocolFeesCollector', () => {
  const vault = new Vault(balancerContractsService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Instantiates the provider service', () => {
    const protocolFeesCollector = new ProtocolFeesCollector(vault);
    expect(protocolFeesCollector).toBeTruthy();
  });

  describe('getSwapFeePercentage', () => {
    it('returns percentage as fractional number', async () => {
      const protocolFeesCollector = new ProtocolFeesCollector(vault);
      const percentage = await protocolFeesCollector.getSwapFeePercentage();

      expect(percentage).toBe(0.1);
    });

    it('returns 0 if error thrown', async () => {
      vi.spyOn(console, 'error').mockImplementationOnce(noop);
      vault.instance.getProtocolFeesCollector.mockImplementation(() => {
        throw new Error('Failed to fetch addresss');
      });

      const protocolFeesCollector = new ProtocolFeesCollector(vault);
      const percentage = await protocolFeesCollector.getSwapFeePercentage();

      expect(percentage).toBe(0);
    });
  });
});
