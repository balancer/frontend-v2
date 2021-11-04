import { tenderlyClient } from '../tenderly.client';
import { TenderlyService } from '../tenderly.service';

interface ForkResponse {
  something: string;
}

interface CreateParams {
  network_id: string;
}

export class ForkEndpoint {
  private endpoint: string;
  private params: CreateParams;

  constructor(
    private readonly service: TenderlyService,
    private readonly client = tenderlyClient
  ) {
    this.endpoint = `/account/${this.service.accountId}/project/${this.service.projectId}/fork`;
    this.params = { network_id: this.service.config.network.key };
  }

  public async create(): Promise<ForkResponse> {
    try {
      const response = await this.client.post<ForkResponse>(
        this.endpoint,
        this.params
      );
      console.log('Fork response', response);
      return response;
    } catch (error) {
      console.error('Unable to create Tenderly fork', error);
      throw error;
    }
  }
}
