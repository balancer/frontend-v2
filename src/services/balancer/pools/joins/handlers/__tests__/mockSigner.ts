import { BigNumber } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import { txResponseMock } from '@/__mocks__/transactions';

export default {
  getAddress: jest.fn().mockReturnValue(AddressZero),
  estimateGas: jest.fn().mockResolvedValue(BigNumber.from(454699)),
  sendTransaction: jest.fn().mockResolvedValue(txResponseMock),
  getChainId: jest.fn().mockResolvedValue(5),
} as unknown as JsonRpcSigner;
