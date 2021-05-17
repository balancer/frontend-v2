import { JsonRpcProvider, AlchemyProvider } from '@ethersproject/providers';
import configs from '@/lib/config';

const providers = {};

export default function getProvider(network: string) {
  const url: string = configs[network].rpc;
  if (!providers[network]) providers[network] = new JsonRpcProvider(url);
  return providers[network];
}

export function getLoggingProvider(network: string) {
  const alchemyKey = 'cQGZUiTLRCFsQS7kbRxPJK4eH4fTTu88';
  return new AlchemyProvider(network, alchemyKey);
}
