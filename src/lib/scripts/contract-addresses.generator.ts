import config from '@/lib/config';
import { Config } from '@/lib/config/types';
import { Address } from '@/types';

const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env.development'),
  });
} else {
  require('dotenv').config();
}

type AddressMap = Record<Address, { task: string; name: string }>;
type ContractMap = Record<string, Address>;

async function generate() {
  Object.values(config).forEach(async (config: Config) => {
    if (!config.monorepoName) return;

    const network = config.monorepoName;
    console.log(`Generating contract addresses for network ${network}...`);
    const addresses: AddressMap = require(`@balancer-labs/v2-deployments/dist/addresses/${network}.json`);

    let contracts: ContractMap = {};
    for (const [address, value] of Object.entries(addresses)) {
      contracts = {
        ...contracts,
        [value.name]: address,
      };
    }

    const sortedContracts = Object.fromEntries(
      Object.entries(contracts).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    ) as ContractMap;

    fs.writeFileSync(
      `./src/assets/data/contracts/${network}.json`,
      JSON.stringify(sortedContracts, null, 2)
    );
  });
}

(async () => {
  try {
    console.log('⏳ Generating contract addresses...');
    await generate();
    console.log(
      '✅ Generated contract addresses at /src/assets/data/contracts/*'
    );
  } catch (error) {
    console.error('Failed to generate contract addresses:', error);
    process.exit(1);
  }
})();
