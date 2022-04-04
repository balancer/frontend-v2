/**
 * Voting gauge generation script
 *
 * run in console with 'npm run script src/lib/scripts/voting-gauge.generator.ts'
 *
 * It should:
 *
 * 1. Take hard coded list of gauge address + network key
 *    e.g [
 *      {
 *        address: '0xE190E5363C925513228Bf25E4633C8cca4809C9a',
 *        network: Network.KOVAN
 *      },
 *      ...
 *    ]
 * 2. Generate a json file for each network represented in the list with same schema currently used in src/constants/voting-gauges.ts
 */

(async () => {
  console.log('Run script');
})();
