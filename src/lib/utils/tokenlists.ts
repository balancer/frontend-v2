import getProvider from '@/lib/utils/provider';
import { ipfsGet } from '@/lib/utils/balancer/ipfs';
import { resolveContent } from '@/lib/utils/balancer/contentHash';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

export async function loadTokenlist(uri: string) {
  if (uri.endsWith('.eth')) {
    const { protocolType, decoded } = await resolveContent(
      getProvider('1'),
      uri
    );
    return await loadTokenlist(`${protocolType}://${decoded}`);
  }
  const [protocolType, path] = uri.split('://');
  if (protocolType.includes('http')) {
    return fetch(uri).then(res => res.json());
  }
  return await ipfsGet(gateway, path, protocolType);
}

export function getTokensListURL(uri: string) {
  const listURI = uri.startsWith('ipns')
    ? `https://gateway.ipfs.io/ipns/${uri.split('://')[1]}`
    : uri;

  return `https://tokenlists.org/token-list?url=${listURI}`;
}
