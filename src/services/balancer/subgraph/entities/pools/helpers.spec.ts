import { pickBy } from 'lodash';

import mockExcludedAddresses from './__mocks__/excludedAddresses';
import mockDecoratedPool from './__mocks__/decoratedPool';

import { removeAddressesFromTotalLiquidity } from './helpers';

describe('helpers', () => {
  describe('removeAddressesFromTotalLiquidity tests', () => {
    it('Should correctly remove excluded addresses', () => {
      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        mockExcludedAddresses,
        mockDecoratedPool,
        mockDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual(
        '2390.29774029333387320036489667810835644165'
      );
    });

    it('Should return unchanged totalLiquidity when excluded addresses belong to different pools', () => {
      const mockExcludedAddressesWithoutPool = pickBy(
        mockExcludedAddresses,
        (_, poolAddress) => poolAddress !== mockDecoratedPool.address
      );

      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        mockExcludedAddressesWithoutPool,
        mockDecoratedPool,
        mockDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual(mockDecoratedPool.totalLiquidity);
    });

    it('Should return unchanged totalLiquidity when excludedAddresses is null', () => {
      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        null,
        mockDecoratedPool,
        mockDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual(mockDecoratedPool.totalLiquidity);
    });
  });
});
