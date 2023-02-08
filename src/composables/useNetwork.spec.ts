import {
  getRedirectUrlFor,
  getSubdomain,
  handleNetworkSlug,
} from './useNetwork';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/services/config/config.service', () => {
  return {
    configService: {
      env: {
        APP_DOMAIN: 'app.balancer.fi',
      },
    },
  };
});

describe('useNetwork', () => {
  describe('getSubdomain', () => {
    it('should get correct top level domains', () => {
      const urls = [
        { path: 'polygon.balancer.fi/#/test', result: 'polygon' },
        { path: 'app.balancer.fi', result: 'app' },
        { path: 'balancer.fi', result: 'balancer' },
        { path: 'beta.balancer.fi/swap', result: 'balancer' },
        { path: 'beta.goerli.balancer.fi', result: 'goerli' },
        { path: 'beta.polygon.balancer.fi', result: 'polygon' },
        { path: 'beta.arbitrum.balancer.fi', result: 'arbitrum' },
        { path: 'beta.balancer.fi/#/claim/test', result: 'balancer' },
        { path: 'localhost:8080', result: 'localhost:8080' },
        { path: 'localhost', result: 'localhost' },
      ];

      urls.forEach(url => {
        expect(getSubdomain(url.path)).toEqual(url.result);
      });
    });
  });

  describe('getRedirectUrlFor', () => {
    it('should return the correct redirect URL', () => {
      const cases = [
        {
          inputs: ['polygon.balancer.fi', '/swap'],
          output: 'https://app.balancer.fi/#/polygon/swap',
        },
        {
          inputs: ['arbitrum.balancer.fi', '/portfolio'],
          output: 'https://app.balancer.fi/#/arbitrum/portfolio',
        },
        {
          inputs: ['goerli.balancer.fi', '/claims'],
          output: 'https://app.balancer.fi/#/goerli/claims',
        },
        {
          inputs: ['polygon.balancer.fi', '/'],
          output: 'https://app.balancer.fi/#/polygon/',
        },
        {
          inputs: ['app.balancer.fi', '/'],
          output: undefined,
        },
        {
          inputs: ['app.balancer.fi', '/swap'],
          output: undefined,
        },
        {
          inputs: [
            'polygon.balancer.fi',
            '/polygon/swap',
            { networkSlug: 'polygon' },
          ],
          output: 'https://app.balancer.fi/#/polygon/swap',
        },
      ];

      cases.forEach(({ inputs, output }) => {
        const inputParams = inputs as [string, string];
        expect(getRedirectUrlFor(...inputParams)).toEqual(output);
      });
    });
  });

  it('should render default route when networkSlug is not present/incorrect', () => {
    const networkSlugs = ['staging', 'beta', '123123', ''];

    localStorage.removeItem('networkId');
    const networkChangeArr = networkSlugs.filter(networkSlug =>
      handleNetworkSlug(
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
      return handleNetworkSlug(
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
      return handleNetworkSlug(
        networkSlug,
        () => false,
        () => true
      );
    });
    localStorage.removeItem('networkId');
    expect(networkChangeArr.length).toEqual(networks.length);
  });
});
