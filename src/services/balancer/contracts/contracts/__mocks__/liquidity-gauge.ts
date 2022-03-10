export const mockClaimRewards = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    claimRewards: mockClaimRewards
  };
});

export default mock;
