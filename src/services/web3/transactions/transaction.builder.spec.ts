import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { ContractConcern } from './concerns/contract.concern';
import { RawConcern } from './concerns/raw.concern';
import { TransactionBuilder } from './transaction.builder';

vi.mock('@ethersproject/providers', () => {
  return {
    JsonRpcSigner: vi.fn().mockImplementation(() => {
      return {
        provider: {
          getBlockNumber: vi.fn(),
        },
        sendTransaction: vi.fn(),
        getAddress: vi.fn(),
        getChainId: vi.fn().mockReturnValue('5'),
      };
    }),
  };
});
vi.mock('@/services/rpc-provider/rpc-provider.service');
vi.mock('@/services/gas-price/gas-price.service', () => {
  return {
    gasPriceService: {
      settings: vi.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
      settingsForContractCall: vi.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
    },
  };
});
vi.mock('ethers', () => {
  return {
    Contract: vi.fn().mockImplementation(() => {
      return {
        test: vi.fn(),
      };
    }),
  };
});

const SignerMock = JsonRpcSigner;

describe('TransactionBuilder', () => {
  let signer;

  beforeAll(() => {
    signer = new SignerMock('0x00', 'provider' as any);
  });

  beforeEach(() => {
    vi.spyOn(console, 'log');
  });

  it('Instantiates given signer', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder).toBeTruthy();
  });

  it('Instatiates a contract concern class', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder.contract).toBeTruthy();
    expect(txBuilder.contract).toBeInstanceOf(ContractConcern);
  });

  it('Instantiates a raw concern class', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder.raw).toBeTruthy();
    expect(txBuilder.raw).toBeInstanceOf(RawConcern);
  });

  describe('Contract concern', () => {
    it('It calls given contract with params and options', async () => {
      const txBuilder = new TransactionBuilder(signer);
      await txBuilder.contract.sendTransaction({
        contractAddress: AddressZero,
        abi: ['function test(uint256 amount) public'],
        action: 'test',
        params: [1e18],
      });

      // @ts-ignore
      const contractMock = Contract.mock.results[0].value;

      expect(contractMock.test).toBeCalledWith(1e18, {
        gasLimit: 1e5,
      });
    });
  });

  describe('Raw concern', () => {
    it('It calls sendTransaction for signer', async () => {
      const options = {
        to: AddressZero,
        data: 'test',
      };
      const txBuilder = new TransactionBuilder(signer);
      await txBuilder.raw.sendTransaction(options);
      options['gasLimit'] = 1e5;

      expect(signer.sendTransaction).toBeCalledWith(options);
    });
  });
});
