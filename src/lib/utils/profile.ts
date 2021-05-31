import { subgraphRequest } from '@/lib/utils/subgraph';
import getProvider from '@/lib/utils/provider';

async function get3BoxProfile(address: string): Promise<Record<any, any>> {
  try {
    const {
      profiles: [profile]
    } = await subgraphRequest('https://api.3box.io/graph', {
      profiles: {
        __args: {
          ids: [address]
        },
        name: true,
        eth_address: true,
        image: true
      }
    });
    return profile;
  } catch (error) {
    console.error(error);
    return {};
  }
}

export async function getProfile(address: string, network: string) {
  try {
    const provider = getProvider(network);
    const [ensName, _3BoxProfile] = await Promise.all([
      provider.lookupAddress(address),
      get3BoxProfile(address)
    ]);
    return {
      ens: ensName,
      ...(_3BoxProfile || {})
    };
  } catch (error) {
    console.error(error);
  }
}
