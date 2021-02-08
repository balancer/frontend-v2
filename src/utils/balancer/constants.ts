import kovan from './configs/kovan.json';
import dockerParity from './configs/docker-parity.json';

const config = process.env.VUE_APP_CONFIG || 'kovan';

const configs = {
  kovan,
  'docker-parity': dockerParity
};

export default {
  ...configs[config],
  // Strategy names are i18n translation keys
  strategies: {
    2: {
      type: '2',
      name: 'weightedPool'
    },
    1: {
      type: '1',
      name: 'stablePool'
    }
  }
};
