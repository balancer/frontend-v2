import { configService } from '@/services/config/config.service';

export default function useUrls() {
  function resolve(uri: string): string {
    if (!uri) return '';
    return uri
      .replace('ipfs://', `https://${configService.env.IPFS_NODE}/ipfs/`)
      .replace('ipns://', `https://${configService.env.IPFS_NODE}/ipns/`);
  }

  return { resolve };
}
