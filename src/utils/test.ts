import { id } from '@ethersproject/hash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { FSP_TOKENIZER_FACTORY_ADDRESS } from '@/utils/balancer/constants';

const provider = getProvider('1337');
const address = FSP_TOKENIZER_FACTORY_ADDRESS;

(async function() {
  const topic = id('ControllerCreated(address)');

  const filter = {
    address,
    topics: [topic]
  };

  provider.on(filter, result => {
    console.log(result);
  });

  // Force starting events from this block; for this example
  provider.resetEventsBlock(1);
})();

// Strategy 0 0x44a9F58883aC6Ecb3762fA2C6a9B118C36ED82aD
