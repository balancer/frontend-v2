const path = require('path');
const fs = require('fs');
const axios = require('axios');

async function generate() {
  if (!fs.existsSync('./public/tokens/balancer.json')) {
    const tokenlistResponse = await axios.get(
      'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json'
    );
    const tokenlist = tokenlistResponse.data;
    fs.writeFileSync(
      './public/tokens/balancer.json',
      JSON.stringify(tokenlist)
    );
  }
}

generate()
  .then(() => console.log('Generated tokenlists.'))
  .catch(err => console.error(err));
