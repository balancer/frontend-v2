import { getSubdomain, handleNetworkUrl } from './useNetwork';

jest.mock('@/services/web3/useWeb3');

describe('Navigation guards', () => {
  it('should get correct top level domains', () => {
    const urls = [
      { path: 'polygon.balancer.fi/#/test', result: 'polygon' },
      { path: 'app.balancer.fi', result: 'app' },
      { path: 'balancer.fi', result: 'balancer' },
      { path: 'beta.balancer.fi/trade', result: 'balancer' },
      { path: 'beta.goerli.balancer.fi', result: 'goerli' },
      { path: 'beta.balancer.fi/#/claim/test', result: 'balancer' },
      { path: 'localhost:8080', result: 'localhost:8080' },
      { path: 'localhost', result: 'localhost' },
    ];

    urls.forEach(url => {
      expect(getSubdomain(url.path)).toEqual(url.result);
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
    localStorage.removeItem('networkId');
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
    localStorage.removeItem('networkId');
    expect(networkChangeArr.length).toEqual(networks.length);
  });
});
