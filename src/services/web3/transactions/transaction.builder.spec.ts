import { initEthersContract } from '@/dependencies/EthersContract';
import { initContractConcern } from '@/dependencies/contract.concern';
import { MockedContractWithSigner } from '@/dependencies/EthersContract.mocks';
import { initOldMulticallerWithDefaultMocks } from '@/dependencies/OldMulticaller.mocks';
import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractConcern } from './concerns/contract.concern';
import { RawConcern } from './concerns/raw.concern';
import { TransactionBuilder } from './transaction.builder';

initContractConcern();

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

vi.mock('@/services/gas/gas.service', () => {
  return {
    gasService: {
      settings: vi.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
      settingsForContractCall: vi.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
    },
  };
});

const contractActionMock = vi.fn(() => 1e5);

class ContractMock extends MockedContractWithSigner {
  test = contractActionMock;
}

initOldMulticallerWithDefaultMocks();
//@ts-ignore
initEthersContract(ContractMock);
// Init real implementation to be tested
initContractConcern();

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

      expect(contractActionMock).toBeCalledWith(1e18, {
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
