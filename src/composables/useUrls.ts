import { Container } from 'typedi';
import { ConfigService } from '@/services/config/config.service';

function resolve(uri: string): string {
  if (!uri) {
    return '';
  }

  const configService = Container.get(ConfigService);

  return uri
    .replace('ipfs://', `https://${configService.env.IPFS_NODE}/ipfs/`)
    .replace('ipns://', `https://${configService.env.IPFS_NODE}/ipns/`);
}

export default function useUrls() {
  return { resolve };
}
