const fs = require('fs');
const axios = require('axios');

let tokenlists = {
  balancer:
    'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json'
};

async function generate() {
  if (!fs.existsSync('./public/tokens/balancer.json')) {
    for (const tokenlist of Object.keys(tokenlists)) {
      const tokenlistResponse = await axios.get(tokenlists[tokenlist]);
      const tokenlistJSON = tokenlistResponse.data;
      fs.writeFileSync(
        `./public/tokens/${tokenlist}.json`,
        JSON.stringify(tokenlistJSON)
      );
    }
  }
}

generate()
  .then(() => console.log('Generated tokenlists.'))
  .catch(err => console.error(err));
