import TokenListService from '@/services/token-list/token-list.service';
import { TokenListMap } from '@/types/TokenList';
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env.development')
  });
} else {
  require('dotenv').config();
}

async function generate() {
  let tokenlists: TokenListMap;
  // Handle special case where we are using local test node.
  // If we use the whole list of ~100 tokens, node will most likely crash
  if (process.env.VUE_APP_NETWORK == '31337') {
    tokenlists = require('../../fixtures/listed.tokenlist.json');
  } else {
    const tokenListService = new TokenListService(process.env.VUE_APP_NETWORK);
    tokenlists = await tokenListService.getAll();
  }
  fs.writeFileSync(`./public/data/tokenlists.json`, JSON.stringify(tokenlists));
}

(async () => {
  try {
    console.log('⏳ Generating tokenlists...');
    await generate();
    console.log('✅ Generated tokenlists at /public/data/tokenlists.json');
  } catch (error) {
    console.error('Failed to generate tokenlists:', error);
    process.exit(1);
  }
})();
