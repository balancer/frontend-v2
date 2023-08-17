/**
 * 1. Takes 4 args from command line: network, pool type, and pool ID and optional pool description.
 * 2. Parses relevant network config pools allowlist file.
 * 3. Injects pool ID into the relevant pool type allowlist.
 * 4. Writes new file content back to file.
 *
 * Example usage:
 * npx vite-node ./src/lib/scripts/automatic-prs/allowlist-pool.ts --network ethereum --poolType=stable --poolId=\"0x...\" --poolDescription=foo/bar/baz
 */

import { cac } from 'cac';
import { capitalize } from 'lodash';
import { allowListPool } from './edit-pools-file.js';

const cli = cac();
cli
  .option('--network <network>', 'Choose a network')
  .option('--poolType <poolType>', 'Pool Type')
  .option('--poolId <poolId>', 'Pool ID')
  .option('--poolDescription <poolDescription>', 'Pool Description');

const { options } = cli.parse();

const poolId = options.poolId.replace(/[^0-9a-fA-Fx]+/g, '') as string;
const poolType = capitalize(options.poolType);
let network = options.network as string;
network = network.toLowerCase();
// Allow ethereum alias to correctly generate pool link from allowlist-manual.yml
if (network === 'ethereum') network = 'mainnet';
const { poolDescription } = options;

validateInput({ poolType, network, poolId });

console.log(`🛠️  Adding ${poolId} to ${network} ${poolType} allow list.`);

allowListPool({
  network,
  poolType,
  poolId,
  poolDescription,
});

function validateInput({
  poolType,
  network,
  poolId,
}: {
  poolType: string;
  network: string;
  poolId: string;
}) {
  const poolTypes = ['Weighted', 'Investment', 'Stable'];

  if (!poolTypes.includes(poolType))
    throw Error(`Invalid pool type: ${poolType}`);

  const networkNames = [
    'avalanche',
    'arbitrum',
    'base',
    'gnosis-chain',
    'goerli',
    'mainnet',
    'polygon',
    'optimism',
    'zkevm',
  ];
  if (!networkNames.includes(network))
    throw Error(`Invalid network name: ${network}`);

  if (poolId.length !== 66)
    throw Error(
      `Provided poolId (${poolId}) does not have the expected length.`
    );
}
