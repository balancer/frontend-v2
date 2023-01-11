import { GasPriceService } from './gas-price.service';
import { mock } from 'vitest-mock-extended';
import { Contract } from '@ethersproject/contracts';

async function settingsForContractCall(contractMock) {
  const service = new GasPriceService();
  const emptyParams = [];
  const emptyOptions = {};
  return service.settingsForContractCall(
    contractMock,
    'testAction',
    emptyParams,
    emptyOptions
  );
}

describe('settingsForContractCall', () => {
  it('throws an error when estimateGas throws an error', async () => {
    const contractMock = mock<Contract>();
    // Override read-only property estimateGas
    Object.defineProperty(contractMock, 'estimateGas', {
      value: {
        testAction: () => {
          throw new Error('Error estimating gas');
        },
      },
    });

    let error: Error | null = null;
    try {
      await settingsForContractCall(contractMock);
    } catch (e) {
      if (e instanceof Error) error = e;
    }

    expect(error).toBeDefined();
    expect(error?.message).toBe('Error estimating gas');
  });
});
