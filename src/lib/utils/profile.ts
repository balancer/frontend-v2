import getProvider from '@/lib/utils/provider';

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
    const ensName = await getEnsName(address, network);
    return {
      ens: ensName
    };
  } catch (error) {
    console.error(error);
  }
}
