import { JsonRpcSigner } from '@ethersproject/providers';
import { RawConcern } from './concerns/raw.concern';
import {
  getContractConcern,
  ContractConcernType,
} from '@/dependencies/contract.concern';

export class TransactionBuilder {
  contract!: ContractConcernType;
  constructor(
    public readonly signer: JsonRpcSigner,
    public readonly raw = new RawConcern(signer)
  ) {
    const ContractConcernConstructor = getContractConcern();
    this.contract = new ContractConcernConstructor(this.signer);
  }
}
