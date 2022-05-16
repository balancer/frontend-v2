const { config: dotenvConfig } = require('dotenv');
const { resolve } = require('path');
dotenvConfig({ path: resolve(__dirname, './.env') });

const { ALCHEMY_URL } = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.7.3',
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: ALCHEMY_URL,
        blockNumber: 14761200
      }
    }
  }
};
