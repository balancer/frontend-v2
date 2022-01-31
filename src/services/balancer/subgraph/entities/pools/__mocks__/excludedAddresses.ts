import { parseUnits } from 'ethers/lib/utils';

import { ExcludedAddresses } from '../helpers';

const excludedAddresses: ExcludedAddresses = {
  '0x8f4205e1604133d1875a3E771AE7e4F2b0865639': {
    '0x567d220B0169836cBF351DF70A9c517096ec9De7': parseUnits(
      '132289.51942534185918198'
    ),
    '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f': parseUnits('136955.0')
  },
  '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42': {
    '0x9cff0533972da48ac05a00a375cc1a65e87da7ec': parseUnits(
      '40128595.62666604486068599'
    ),
    '0x7a32aa9a16a59cb335ffdee3dc94024b7f8a9a47': parseUnits(
      '33337383.447714074418798103'
    )
  },
  '0x702605F43471183158938C1a3e5f5A359d7b31ba': {
    '0x359f4fe841f246a095a82cb26f5819e10a91fe0d': parseUnits(
      '84300.012842148570957662'
    ),
    '0x001c249c09090d79dc350a286247479f08c7aad7': parseUnits(
      '65903.019673244882572501'
    )
  }
};

export default excludedAddresses;
