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

export async function generateCommon() {
  console.log('Generating common token list');
  const tokenListService = new TokenListService();
  const tokenlists = await tokenListService.getAll();

  fs.writeFileSync(
    `./src/assets/data/tokenlists/tokens-common.json`,
    JSON.stringify(tokenlists)
  );
}

(async () => {
  try {
    console.log('⏳ Generating tokenlists...');
    await generateCommon();
    console.log('✅ Generated tokenlists at /src/assets/data/tokenlists/*');
  } catch (error) {
    console.error('Failed to generate tokenlists:', error);
    process.exit(1);
  }
})();
