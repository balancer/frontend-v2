/**
 * 1. Takes 3 args from command line: network, pool type, and pool ID.
 * 2. Parses relevant network config pools allowlist file.
 * 3. Injects pool ID into the relevant pool type allowlist.
 * 4. Writes new file content back to file.
 *
 * Example usage:
 * npx vite-node ./src/lib/scripts/allowlist-pool.ts -- --network mainnet --poolType=stable --poolId=\"0x...\"
 */
const cli = require('cac')();
const fs = require('fs');
const path = require('path');

cli
  .option('--network <network>', 'Choose a network')
  .option('--poolType <poolType>', 'Choose a network')
  .option('--poolId <poolId>', 'Choose a network');

const {
  options: { network, poolType, poolId },
} = cli.parse();

const _poolId = poolId.replace(/"/g, '');

console.log('Injecting:', network, poolType, _poolId);

const allowlistPath = path.resolve(
  __dirname,
  `../config/${network}/allowlists/${poolType}.json`
);
const allowlist = require(allowlistPath);

allowlist.push(_poolId);

try {
  fs.writeFileSync(allowlistPath, JSON.stringify(allowlist, null, 2));
} catch (error) {
  console.error('Failed to write allowlist file.', { cause: error });
}

export {};
