import nock from 'nock';

import BlocknativeProvider from './blocknative.provider';

const defaultResponse = {
  blockPrices: [
    {
      estimatedPrices: [
        {
          confidence: 70,
          price: 32.12,
          maxFeePerGas: 32.12,
          maxPriorityFeePerGas: 1.5,
        },
        {
          confidence: 90,
          price: 66.15,
          maxFeePerGas: 66.15,
          maxPriorityFeePerGas: 1.5,
        },
      ],
    },
  ],
};

describe('Blocknative Provider', () => {
  const blocknativeProvider = new BlocknativeProvider();

  beforeEach(() => {
    nock('https://api.blocknative.com')
      .options('/gasprices/blockprices')
      .reply(200);

    nock('https://api.blocknative.com')
      .get('/gasprices/blockprices')
      .reply(200, defaultResponse);
  });

  it('Should not return gas values with rounding errors', async () => {
    const response = await blocknativeProvider.getGasPrice();
    expect(response?.price).toEqual(32120000000);
    expect(response?.maxFeePerGas).toEqual(32120000000);
    expect(response?.maxPriorityFeePerGas).toEqual(1500000000);
  });
});
