import { BigNumber } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import { txResponseMock } from '@/__mocks__/transactions';

export default {
  getAddress: vi.fn().mockReturnValue(AddressZero),
  estimateGas: vi.fn().mockResolvedValue(BigNumber.from(454699)),
  sendTransaction: vi.fn().mockResolvedValue(txResponseMock),
  getChainId: vi.fn().mockResolvedValue(5),
} as unknown as JsonRpcSigner;
