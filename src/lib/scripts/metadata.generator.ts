import axios from 'axios';

const fs = require('fs');

const baseUrl = 'https://raw.githubusercontent.com/balancer/metadata/main';
const filesToFetch = ['/pools/groups/LRT.json'];

async function generate() {
  filesToFetch.forEach(async file => {
    console.log(`Generating metadata for file ${file}...`);
    const { data } = await axios(baseUrl + file);
    fs.writeFileSync(`./src/assets/data${file}`, JSON.stringify(data, null, 2));
  });
}

(async () => {
  try {
    console.log('⏳ Generating metadata...');
    await generate();
    console.log('✅ Generated metadata at /src/assets/data/*');
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    process.exit(1);
  }
})();
