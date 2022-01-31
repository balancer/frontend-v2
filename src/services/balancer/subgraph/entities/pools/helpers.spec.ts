import { parseUnits } from '@ethersproject/units';

import decoratedPool from './__mocks__/decoratedPool';

import {
  ExcludedAddresses,
  removeAddressesFromTotalLiquidity
} from './helpers';

describe('helpers', () => {
  describe('removeAddressesFromTotalLiquidity tests', () => {
    const mockedDecoratedPool = {
      ...decoratedPool,
      totalShares: '1000',
      totalLiquidity: '2000'
    };

    it('Should correctly remove excluded addresses', () => {
      const excludedAddresses: ExcludedAddresses = {
        [mockedDecoratedPool.address]: {
          '0x359f4fe841f246a095a82cb26f5819e10a91fe0d': parseUnits('250'),
          '0x001c249c09090d79dc350a286247479f08c7aad7': parseUnits('250')
        }
      };

      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        excludedAddresses,
        mockedDecoratedPool,
        mockedDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual('1000');
    });

    it('Should return unchanged totalLiquidity when excludedAddresses belong to different pools', () => {
      const excludedAddresses: ExcludedAddresses = {
        '0x8f4205e1604133d1875a3E771AE7e4F2b0865639': {
          '0x567d220B0169836cBF351DF70A9c517096ec9De7': parseUnits('100'),
          '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f': parseUnits('300')
        },
        '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42': {
          '0x9cff0533972da48ac05a00a375cc1a65e87da7ec': parseUnits('50'),
          '0x7a32aa9a16a59cb335ffdee3dc94024b7f8a9a47': parseUnits('400')
        }
      };

      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        excludedAddresses,
        mockedDecoratedPool,
        mockedDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual(
        mockedDecoratedPool.totalLiquidity.toString()
      );
    });

    it('Should return unchanged totalLiquidity when excludedAddresses is null', () => {
      const miningTotalLiquidity = removeAddressesFromTotalLiquidity(
        null,
        mockedDecoratedPool,
        mockedDecoratedPool.totalLiquidity
      );

      expect(miningTotalLiquidity).toEqual(
        mockedDecoratedPool.totalLiquidity.toString()
      );
    });
  });
});
