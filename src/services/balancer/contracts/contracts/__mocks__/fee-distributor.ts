import { txResponseMock } from '@/__mocks__/transactions';

const FeeDistributor = jest.fn().mockImplementation(() => {
  return {
    claimableTokens: [
      '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
      '0xba100000625a3754423978a60c9317c58a424e3D'
    ],
    claimBalance: jest.fn().mockResolvedValue(txResponseMock),
    claimBalances: jest.fn().mockResolvedValue(txResponseMock)
  };
});

export const feeDistributor = new FeeDistributor();
