import axios from 'axios';
import { Service } from 'typedi';
import { ConfigService } from '../config/config.service';

@Service()
export class IpfsService {
  gateway: string;

  constructor(private readonly configService: ConfigService) {
    this.gateway = this.configService.env.IPFS_NODE;
  }

  async get<T>(hash: string, protocol = 'ipfs'): Promise<T> {
    const { data } = await axios.get(
      `https://${this.gateway}/${protocol}/${hash}`
    );
    return data;
  }
}
