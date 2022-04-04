import nock from 'nock';

import { ipfsService } from '@/services/ipfs/ipfs.service';

describe('IPFS service', () => {
  describe('Get data given IPFS hash', () => {
    it('Returns data via IPFS protocol', async () => {
      nock('https://cloudflare-ipfs.com')
        .get('/ipfs/xyz')
        .reply(200, 'some data');
      const data = await ipfsService.get('xyz');
      expect(data).toBe('some data');
    });

    it('Returns data via IPNS protocol', async () => {
      nock('https://cloudflare-ipfs.com')
        .get('/ipns/xyz')
        .reply(200, 'some data');
      const data = await ipfsService.get('xyz', 'ipns');
      expect(data).toBe('some data');
    });
  });
});
