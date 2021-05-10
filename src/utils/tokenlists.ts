import getProvider from '@/utils/provider';
import { ipfsGet } from '@/utils/balancer/ipfs';
import { resolveContent } from '@/utils/balancer/contentHash';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

export async function loadTokenlist(uri) {
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
