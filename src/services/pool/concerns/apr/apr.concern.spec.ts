import { PoolMock } from '@/__mocks__/pool';
import { AprConcern } from './apr.concern';

describe('AprConcern', () => {
  it('Instantiates the class', () => {
    const aprConcern = new AprConcern(PoolMock);
    expect(aprConcern).toBeTruthy();
  });
});
