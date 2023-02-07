// TODO: Understand why this global mock is not working when doing:
// vi.mock('@ethersproject/address');

export default {
  getAddress: address => address,
  isAddress: () => true,
};
