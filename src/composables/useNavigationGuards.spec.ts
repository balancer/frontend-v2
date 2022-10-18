import {
  getOldFormatRedirectUrl,
  getTopLevelDomain,
  handleNetworkUrl,
} from './useNavigationGuards';
import { Network } from '@balancer-labs/sdk';

jest.mock('@/services/web3/useWeb3');

describe('Navigation guards', () => {
  it('should get correct top level domains', () => {
    const urls = [
      { path: 'polygon.balancer.fi/#/test', result: 'polygon' },
      { path: 'app.balancer.fi', result: 'app' },
      { path: 'balancer.fi', result: 'balancer' },
      { path: 'staging.balancer.fi/trade', result: 'balancer' },
      { path: 'staging.goerli.balancer.fi', result: 'goerli' },
      { path: 'beta.balancer.fi/#/claim/test', result: 'balancer' },
      { path: 'localhost:8080', result: 'localhost:8080' },
      { path: 'localhost', result: 'localhost' },
    ];

    urls.forEach(url => {
      expect(getTopLevelDomain(url.path)).toEqual(url.result);
    });
  });

  it('should get correct url redirects for old format urls', () => {
    const urls = [
      {
        networkFromSubdomain: 137 as Network,
        networkSlug: undefined,
        fullPath: '/pool/create',
        result: 'https://localhost:8080/#/polygon/pool/create',
      },
      {
        networkFromSubdomain: 5 as Network,
        networkSlug: undefined,
        fullPath: '/pool/create',
        result: 'https://localhost:8080/#/goerli/pool/create',
      },
      {
        networkFromSubdomain: 1 as Network,
        networkSlug: undefined,
        fullPath: '/pool/create',
        result: 'https://localhost:8080/#/ethereum/pool/create',
      },
      {
        networkFromSubdomain: 1 as Network,
        networkSlug: 'ethereum',
        fullPath: '/ethereum/pool/create',
        result: 'https://localhost:8080/#/ethereum/pool/create',
      },
      {
        networkFromSubdomain: 5 as Network,
        networkSlug: 'polygon',
        fullPath: '/polygon/pool/create',
        result: 'https://localhost:8080/#/polygon/pool/create',
      },
      {
        networkFromSubdomain: 137 as Network,
        networkSlug: 'ethereum',
        fullPath: '/ethereum/pool/create',
        result: 'https://localhost:8080/#/ethereum/pool/create',
      },
      {
        networkFromSubdomain: 137 as Network,
        networkSlug: 'arbitrum',
        fullPath: '/arbitrum/pool/create',
        result: 'https://localhost:8080/#/arbitrum/pool/create',
      },
    ];

    urls.forEach(({ networkFromSubdomain, networkSlug, result, fullPath }) => {
      expect(
        getOldFormatRedirectUrl(networkFromSubdomain, networkSlug, fullPath)
      ).toEqual(result);
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
