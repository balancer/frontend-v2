import { getTopLevelDomain, handleNetworkUrl } from './useNavigationGuards';

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

  it('should render default route when networkSlug is not present/incorrect', () => {
    const networkSlugs = ['staging', 'beta', '123123', ''];

    localStorage.removeItem('networkId');
    const networkChangeArr = networkSlugs.filter(networkSlug =>
      handleNetworkUrl(
        networkSlug,
        () => false,
        () => true
      )
    );
    expect(networkChangeArr.length).toEqual(0);
  });

  it('should render default route when networkSlug is the same as localStorage networkId', () => {
    const networks = [
      { networkSlug: 'ethereum', networkId: '1' },
      { networkSlug: 'arbitrum', networkId: '42161' },
      { networkSlug: 'polygon', networkId: '137' },
      { networkSlug: 'goerli', networkId: '5' },
    ];

    localStorage.removeItem('networkId');
    const networkChangeArr = networks.filter(({ networkSlug, networkId }) => {
      localStorage.setItem('networkId', networkId);
      return handleNetworkUrl(
        networkSlug,
        () => false,
        () => true
      );
    });
    expect(networkChangeArr.length).toEqual(0);
  });

  it('should redirect route when networkSlug is different to localStorage networkId', () => {
    const networks = [
      { networkSlug: 'arbitrum' },
      { networkSlug: 'polygon' },
      { networkSlug: 'goerli' },
    ];

    localStorage.removeItem('networkId');
    const networkChangeArr = networks.filter(({ networkSlug }) => {
      localStorage.setItem('networkId', '1');
      return handleNetworkUrl(
        networkSlug,
        () => false,
        () => true
      );
    });
    expect(networkChangeArr.length).toEqual(networks.length);
  });
});
