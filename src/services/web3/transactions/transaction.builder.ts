import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractConcern } from './concerns/contract.concern';
import { RawConcern } from './concerns/raw.concern';

export class TransactionBuilder {
  constructor(
    public readonly signer: JsonRpcSigner,
    public readonly contract = new ContractConcern(signer),
    public readonly raw = new RawConcern(signer)
  ) {}
}
