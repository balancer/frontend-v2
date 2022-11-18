import { PoolMock } from '@/__mocks__/pool';

import { AprConcern } from './apr.concern';

jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/lido/lido.service');
jest.mock('@/services/aave/aave.service');
jest.mock('./calcs/vebal-apr.calc');
jest.mock('@/composables/useNumbers');

describe('AprConcern', () => {
  it('Instantiates the class', () => {
    const aprConcern = new AprConcern(PoolMock);
    expect(aprConcern).toBeTruthy();
  });
});
