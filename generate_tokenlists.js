require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const ethers = require('ethers');

const networkConfigMap = {
  '1': require('./src/lib/config/homestead.json'),
  '137': require('./src/lib/config/polygon.json'),
  '42': require('./src/lib/config/kovan.json'),
  '42161': require('./src/lib/config/arbitrum.json')
};

const tokenlists = require('./src/constants/tokenlist_map.json');

const networkTokenLists = tokenlists[process.env.VUE_APP_NETWORK || '1'];

async function retrieveFromENS(ensName) {
  const provider = ethers.providers.JsonRpcProvider();
  const resolver = await this.provider.getResolver(ensName);
  if (resolver === null) throw new Error('Could not resolve ENS');
  const [, ipfsHash] = (await resolver.getContentHash()).split('://');
  return await this.ipfsService.get < TokenList > (ipfsHash);
}

async function generate() {
  const balancerVettedList = (
    await axios.get(networkTokenLists.Balancer.Vetted)
  ).data;

  const balancerDefaultList = (
    await axios.get(networkTokenLists.Balancer.Default)
  ).data;
  const externalLists = await Promise.all(
    networkTokenLists.External.map(async tokenlistURL => {
      let formattedUrl = tokenlistURL;

      if (tokenlistURL.includes('ipns')) {
        formattedUrl = tokenlistURL.replace(
          'ipns://',
          `https://${process.env.VUE_APP_IPFS_NODE}/ipns/`
        );
      }
      const list = await axios.get(formattedUrl);
      return list.data;
    })
  );

  fs.writeFileSync(
    `./public/tokens/Balancer.Vetted.json`,
    JSON.stringify(balancerVettedList)
  );
  fs.writeFileSync(
    `./public/tokens/Balancer.Default.json`,
    JSON.stringify(balancerDefaultList)
  );
  externalLists.forEach((list, i) => {
    fs.writeFileSync(
      `./public/tokens/External-${i}.json`,
      JSON.stringify(list)
    );
  });
}

generate()
  .then(() => console.log('Generated tokenlists.'))
  .catch(err => console.error(err));
