import { ipfsService } from '@/services/ipfs/ipfs.service';
import nock from 'nock';

describe('IPFS service', () => {
  describe('Get data given IPFS hash', () => {
    it('Constructs correct ipfs url', async () => {
      nock('https://ipfs.fleek.co')
        .get('/ipfs/xyz')
        .reply(200, 'some data');
      const data = await ipfsService.get('xyz');
      expect(data).toBe('some data');
    });
  });
});
