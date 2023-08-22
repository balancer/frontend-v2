import TokenListService from '@/services/token-list/token-list.service';
import config from '@/lib/config';
import { Network } from '@/lib/config/types';

const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env.development'),
  });
} else {
  require('dotenv').config();
}

async function generate() {
  Object.keys(config).forEach(async (networkId: string) => {
    console.log(`Generating tokenlist for network ${networkId}...`);
    const network = Number(networkId) as Network;
    const tokenListService = new TokenListService(network);
    // check if any uris are avaialble
    if (tokenListService.uris.All.find(uri => !!uri)) {
      const tokenlists = await tokenListService.getAll();
      const filteredTokensList = TokenListService.filterTokensList(
        tokenlists,
        network
      );
      fs.writeFileSync(
        `./src/assets/data/tokenlists/tokens-${networkId}.json`,
        JSON.stringify(filteredTokensList)
      );
    }
  });
}

(async () => {
  try {
    console.log('⏳ Generating tokenlists...');
    await generate();
    console.log('✅ Generated tokenlists at /src/assets/data/tokenlists/*');
  } catch (error) {
    console.error('Failed to generate tokenlists:', error);
    process.exit(1);
  }
})();
