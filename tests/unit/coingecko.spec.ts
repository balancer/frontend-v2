global.fetch = require('node-fetch');
import { getTokensPrice } from '@/api/coingecko';

describe('coingecko.getTokensPrice', () => {
  it('return tokens usd price', async () => {
    const addresses = [
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xba100000625a3754423978a60c9317c58a424e3D'
    ];
    const prices = await getTokensPrice(1, addresses);
    expect(
      prices['0x6b175474e89094c44da98b954eedeac495271d0f'].price
    ).toBeGreaterThan(0);
    expect(
      prices['0xba100000625a3754423978a60c9317c58a424e3d'].price
    ).toBeGreaterThan(0);
  });
});
