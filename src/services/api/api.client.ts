import { Network } from '@balancer-labs/sdk';
import { configService } from '../config/config.service';

class ApiClient {
  constructor(
    public readonly baseUrl = configService.network.api,
    public readonly appNetwork = configService.network.chainId
  ) {}

  async get<T>({
    query,
    network = this.appNetwork,
  }: {
    query: string;
    network?: Network;
  }): Promise<T> {
    if (!this.baseUrl) throw new Error('No API URL provided');

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        chainId: network.toString(),
      },
      body: JSON.stringify({ query }),
    });
    const { data }: { data: T } = await res.json();

    return data;
  }
}

export const api = new ApiClient();
