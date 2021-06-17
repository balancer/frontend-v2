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

async function getEnsName(
  address: string,
  network: string
): Promise<string | null> {
  try {
    const provider = getProvider(network);
    return await provider.lookupAddress(address);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getProfile(address: string, network: string) {
  try {
    const [ensName, _3BoxProfile] = await Promise.all([
      getEnsName(address, network),
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
