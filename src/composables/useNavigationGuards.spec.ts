import { getTopDomain } from './useNavigationGuards';

describe('should get correct top level domains', () => {
  const urls = [
    { path: 'polygon.balancer.fi', expect: 'polygon' },
    { path: 'app.balancer.fi', expect: 'app' },
    { path: 'balancer.fi', expect: 'balancer' },
    { path: 'staging.balancer.fi', expect: 'balancer' },
    { path: 'staging.goerli.balancer.fi', expect: 'goerli' },
    { path: 'beta.balancer.fi', expect: 'balancer' },
    { path: 'localhost:8080', expect: 'localhost:8080' },
    { path: 'localhost', expect: 'localhost' },
  ];

  urls.forEach(url => {
    expect(getTopDomain(url.path)).toEqual(url.expect);
  });
});
