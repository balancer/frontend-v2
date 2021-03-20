import homestead from '@/config/homestead.json';
import kovan from '@/config/kovan.json';
import docker from '@/config/docker.json';

interface Config {
  key: string;
  chainId: number;
  name: string;
  shortName: string;
  network: string;
  unknown: boolean;
  rpc: string;
  ws: string;
  explorer: string;
  subgraphBackupUrl: string;
  addresses: {
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    exchangeProxy: string;
    weth: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
}

const config: Record<string, Config> = {
  '1': homestead,
  '42': kovan,
  '17': docker
};

export default config;
