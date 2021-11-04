import axios, { AxiosRequestConfig } from 'axios';
import { configService } from '../config/config.service';

export class TenderlyClient {
  baseUrl: string;
  axiosConfig: AxiosRequestConfig;

  constructor(private readonly config = configService) {
    this.baseUrl = 'https://api.tenderly.co/api/v1';
    this.axiosConfig = {
      headers: {
        'X-Access-Key': this.config.env.TENDERLY_ACCESS_TOKEN
      }
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const { data } = await axios.get(this.baseUrl + endpoint, this.axiosConfig);
    return data;
  }

  async post<T>(endpoint: string, payload: any): Promise<T> {
    const { data } = await axios.post(
      this.baseUrl + endpoint,
      payload,
      this.axiosConfig
    );
    return data;
  }
}

export const tenderlyClient = new TenderlyClient();
