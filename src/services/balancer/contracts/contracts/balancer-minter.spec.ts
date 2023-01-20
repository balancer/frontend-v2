import { BalancerMinter } from './balancer-minter';

vi.mock('@/services/web3/web3.service');
vi.mock('@/services/rpc-provider/rpc-provider.service');

describe('BalancerMinter', () => {
  it('Instantiates the class', () => {
    const balancerMinter = new BalancerMinter();
    expect(balancerMinter).toBeTruthy();
  });
});
