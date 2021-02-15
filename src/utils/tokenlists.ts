import getProvider from '@/utils/provider';
import { ipfsGet } from '@snapshot-labs/snapshot.js/src/utils';
import { resolveContent } from '@snapshot-labs/snapshot.js/src/utils/contentHash';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

export async function loadTokenlist(name) {
  const { protocolType, decoded } = await resolveContent(
    getProvider('1'),
    name
  );
  return await ipfsGet(gateway, decoded, protocolType);
}
