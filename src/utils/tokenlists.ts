import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ipfsGet } from '@snapshot-labs/snapshot.js/src/utils';
import { resolveContent } from '@snapshot-labs/snapshot.js/src/utils/contentHash';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';

const gateway = process.env.VUE_APP_IPFS_NODE || gateways[0];

export async function loadTokenlist(name) {
  const { protocolType, decoded } = await resolveContent(
    getProvider('1'),
    name
  );
  return await ipfsGet(gateway, decoded, protocolType);
}
