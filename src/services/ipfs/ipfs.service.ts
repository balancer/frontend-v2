import axios from 'axios';
import ConfigService from '../config/config.service';

export default class IpfsService {
  gateway: string;

  constructor(private readonly configService = new ConfigService()) {
    this.gateway = configService.env.IPFS_NODE;
  }

  async get(hash: string, protocol = 'ipfs'): Promise<unknown> {
    const { data } = await axios.get(
      `https://${this.gateway}/${protocol}/${hash}`
    );
    return data;
  }
}
