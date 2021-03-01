const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

const POOLS_IPFS_URL = {
  '1': 'balancer-team-bucket.storage.fleek.co/balancer-v2/pools',
  '42': 'balancer-team-bucket.storage.fleek.co/balancer-kovan-v2/pools'
};

export async function ipfsGet(
  gateway: string,
  ipfsHash: string,
  protocolType = 'ipfs'
) {
  const url = `https://${gateway}/${protocolType}/${ipfsHash}`;
  return fetch(url).then(res => res.json());
}

export async function getPoolsFromIPFS(network: string) {
  try {
    const { pools } = await ipfsGet(gateway, POOLS_IPFS_URL[network], 'ipns');
    return pools;
  } catch (e) {
    return {};
  }
}
