import TokenListService from '@/services/token-list/token-list.service';
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
  const tokenListService = new TokenListService(process.env.VUE_APP_NETWORK);
  const tokenlists = await tokenListService.getAll();
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
