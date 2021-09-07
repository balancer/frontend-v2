import nock from 'nock';
import Container from 'typedi';
import { IpfsService } from '@/services/ipfs/ipfs.service';

describe('IPFS service', () => {
  describe('Get data given IPFS hash', () => {
    it('Returns data via IPFS protocol', async () => {
      nock('https://ipfs.fleek.co')
        .get('/ipfs/xyz')
        .reply(200, 'some data');
      const data = await Container.get(IpfsService).get('xyz');
      expect(data).toBe('some data');
    });

    it('Returns data via IPNS protocol', async () => {
      nock('https://ipfs.fleek.co')
        .get('/ipns/xyz')
        .reply(200, 'some data');
      const data = await Container.get(IpfsService).get('xyz', 'ipns');
      expect(data).toBe('some data');
    });
  });
});
