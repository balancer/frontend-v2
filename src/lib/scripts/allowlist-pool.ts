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
  .option('--poolType <poolType>', 'Pool Type')
  .option('--poolId <poolId>', 'Pool ID')
  .option('--poolDescription <poolDescription>', 'Pool Description');

const {
  options: { network, poolType, poolId, poolDescription },
} = cli.parse();

const _poolId = poolId.replace(/[^0-9a-fA-Fx]+/g, '');
const description = poolDescription ? ` // ${poolDescription}` : '';

console.log('Injecting:', network, poolType, _poolId, poolDescription);

const allowlistPath = path.resolve(
  __dirname,
  `../config/${network}/allowlists/${poolType}.ts`
);
const allowlistText = fs.readFileSync(allowlistPath, 'utf-8');
let allowlist = allowlistText.split('\n');

const closingLines = allowlist.splice(-2, 2);
allowlist.push(`  '${_poolId}',${description}`);
allowlist = allowlist.concat(closingLines);

try {
  fs.writeFileSync(allowlistPath, allowlist.join('\n'));
} catch (error) {
  console.error('Failed to write allowlist file.', { cause: error });
}

export {};
