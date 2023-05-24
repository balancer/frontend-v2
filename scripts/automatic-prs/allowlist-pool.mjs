import { program } from 'commander';
import { spawn } from 'child_process';
import { allowListPool } from './edit-pools-file.mjs';

function runCommand(command) {
  spawn(command, {
    shell: true,
    stdio: 'inherit',
  });
}

/**
 *  Command line example:
 *  node ./scripts/automatic-prs/allowlist-pool.mjs -t Weighted -n mainnet -a 0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bd -c foo/bar/baz
 */
program
  .description('A CLI for allow listing pool addresses')
  .version('0.0.1')
  .option('-t, --type <type>', 'Pool type')
  .option(
    '-n, --network <network>',
    'Network name (mainnet/polygon/arbitrum/goerli)'
  )
  .option('-a, --address <address>', 'Address of pool to be allow listed')
  .option(
    '-c, --comment <comment>',
    'Extra information to add as a comment beside the allowed pool address'
  )
  .parse();

const options = program.opts();

validateInput(options);

const { type, network, address, comment } = options;
console.log(`🛠️  Adding ${address} to ${network} ${type} allow list.`);

allowListPool({
  network,
  allowListType: type, // Stable, Investment, Weighted, Stakable
  poolAddress: address,
  comment,
});

runCommand(`npm run lint:fix ./src/lib/config/${network}`);

function validateInput({ type, network }) {
  const poolTypes = [
    'Weighted',
    'Investment',
    'Stable',
    'ComposableStable',
    'MetaStable',
  ];
  if (!poolTypes.includes(type)) throw Error(`Invalid pool type: ${type}`);

  const networkNames = ['mainnet', 'polygon', 'arbitrum', 'gnosis', 'goerli'];
  if (!networkNames.includes(network))
    throw Error(`Invalid network name: ${network}`);
}
