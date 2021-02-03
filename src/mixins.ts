import { mapState } from 'vuex';
import numeral from 'numeral';
import get from 'lodash/get';
import prettyMs from 'pretty-ms';
import networks from '@/utils/networks.json';
import store from '@/store';
import { shorten } from '@/utils';
import { formatUnits } from '@ethersproject/units';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  computed: {
    ...mapState(modules)
  },
  methods: {
    _get(object, path, fb) {
      return get(object, path, fb);
    },
    _ms(number) {
      const diff = number * 1e3 - new Date().getTime();
      return prettyMs(diff);
    },
    _num(number, format) {
      if (!format) {
        format = '(0.[0]a)';
        if (number < 1) format = '0.[000]';
        if (number == 0) return '-';
      }
      return numeral(number).format(format);
    },
    _units(bn, decimals) {
      return formatUnits(bn, decimals);
    },
    _shorten(str: string, key: string): string {
      if (!str) return str;
      let limit;
      if (key === 'symbol') limit = 6;
      if (key === 'name') limit = 18;
      if (key === 'choice') limit = 12;
      if (limit)
        return str.length > limit ? `${str.slice(0, limit).trim()}...` : str;
      return shorten(str);
    },
    _ipfsUrl(ipfsHash: string): string {
      return `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/${ipfsHash}`;
    },
    _url(url) {
      if (!url) return '';
      return url
        .replace('ipfs://', `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/`)
        .replace('ipns://', `https://${process.env.VUE_APP_IPFS_NODE}/ipns/`);
    },
    _explorer(network, str: string, type = 'address'): string {
      return `${networks[network].explorer}/${type}/${str}`;
    }
  }
};
