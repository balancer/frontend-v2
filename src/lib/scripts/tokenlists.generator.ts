require('dotenv').config();
import { tokenListService } from '@/services/token-list/token-list.service';
const fs = require('fs');

async function generate() {
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
