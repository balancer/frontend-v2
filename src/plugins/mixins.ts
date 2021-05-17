import { shorten } from '@/lib/utils';

export default {
  methods: {
    _shorten(str: string, key: string): string {
      if (!str) return str;
      let limit;
      if (key === 'symbol') limit = 6;
      if (key === 'name') limit = 18;
      if (key === 'choice') limit = 12;
      if (limit)
        return str.length > limit ? `${str.slice(0, limit).trim()}...` : str;
      return shorten(str);
    },
    _ipfsUrl(ipfsHash: string): string {
      return `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/${ipfsHash}`;
    },
    _url(url) {
      if (!url) return '';
      return url
        .replace('ipfs://', `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/`)
        .replace('ipns://', `https://${process.env.VUE_APP_IPFS_NODE}/ipns/`);
    }
  }
};
