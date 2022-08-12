import { ContractConcern } from './concerns/contract.concern';
import { RawConcern } from './concerns/raw.concern';

export class TransactionBuilder {
  constructor(
    public readonly contract = ContractConcern,
    public readonly raw = RawConcern
  ) {}
}
