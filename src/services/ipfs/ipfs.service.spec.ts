import { ipfsService } from '@/services/ipfs/ipfs.service';

describe('IPFS service', () => {
  describe('Get data given IPFS hash', () => {
    it('Returns data via IPFS protocol', async () => {
      const data = await ipfsService.get('xyz');
      expect(data).toBe('ipfs test response');
    });

    it('Returns data via IPNS protocol', async () => {
      const data = await ipfsService.get('xyz', 'ipns');
      expect(data).toBe('ipns test response');
    });
  });
});
