import { BalancerMinter } from './balancer-minter';

jest.mock('@/services/web3/web3.service');
jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('Balancer', () => {
  it('Instantiates the class', () => {
    const balancerMinter = new BalancerMinter();
    expect(balancerMinter).toBeTruthy();
  });
});
