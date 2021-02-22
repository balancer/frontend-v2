import getProvider from '@/utils/provider';
import { ipfsGet } from '@/utils/balancer/ipfs';
import { resolveContent } from '@/utils/balancer/contentHash';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

export async function loadTokenlist(name) {
  const { protocolType, decoded } = await resolveContent(
    getProvider('1'),
    name
  );
  return await ipfsGet(gateway, decoded, protocolType);
}
