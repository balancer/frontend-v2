import { configService } from '../config/config.service';
import { ForkEndpoint } from './api/fork.endpoint';

export class TenderlyService {
  public fork: ForkEndpoint;
  public accountId: string;
  public projectId: string;

  constructor(
    public readonly config = configService,
    forkEndpointClass = ForkEndpoint
  ) {
    this.accountId = this.config.env.TENDERLY_ACCOUNT_ID;
    this.projectId = this.config.env.TENDERLY_PROJECT_ID;
    this.fork = new forkEndpointClass(this);
  }

  public get available(): boolean {
    const validAccountId = !!this.accountId && this.accountId !== 'MISSING_KEY';
    const validProjectId = !!this.projectId && this.projectId !== 'MISSING_KEY';

    return validAccountId && validProjectId;
  }
}

export const tenderlyService = new TenderlyService();
