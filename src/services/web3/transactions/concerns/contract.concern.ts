import { Contract } from 'ethers';
import { TransactionConcern } from './transaction.concern';

export class ContractConcern extends TransactionConcern {
  constructor(private readonly contractWithSigner: Contract) {
    super();
  }
}
