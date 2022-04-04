import axios from 'axios';

import { configService as _configService } from '../config/config.service';

export default class IpfsService {
  gateway: string;

  constructor(private readonly configService = _configService) {
    this.gateway = this.configService.env.IPFS_NODE;
  }

  async get<T>(hash: string, protocol = 'ipfs'): Promise<T> {
    const { data } = await axios.get(
      `https://${this.gateway}/${protocol}/${hash}`
    );
    return data;
  }
}

export const ipfsService = new IpfsService();
