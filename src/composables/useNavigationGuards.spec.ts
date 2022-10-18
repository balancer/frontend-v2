import { getTopLevelDomain } from './useNavigationGuards';

jest.mock('@/services/web3/useWeb3');

describe('Navigation guards', () => {
  it('should get correct top level domains', () => {
    const urls = [
      { path: 'polygon.balancer.fi/#/test', expect: 'polygon' },
      { path: 'app.balancer.fi', expect: 'app' },
      { path: 'balancer.fi', expect: 'balancer' },
      { path: 'staging.balancer.fi/trade', expect: 'balancer' },
      { path: 'staging.goerli.balancer.fi', expect: 'goerli' },
      { path: 'beta.balancer.fi/#/claim/test', expect: 'balancer' },
      { path: 'localhost:8080', expect: 'localhost:8080' },
      { path: 'localhost', expect: 'localhost' },
    ];

    urls.forEach(url => {
      expect(getTopLevelDomain(url.path)).toEqual(url.expect);
    });
  });
});
