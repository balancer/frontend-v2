import { networkId } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';

interface BrandedRedirectData {
  id: string;
  title: string;
  description: string;
  btnText: string;
  link: string;
}

type BrandedRedirects = Record<string, BrandedRedirectData>;

const POLYGON_BRANDED_REDIRECTS: BrandedRedirects = {
  '0x726e324c29a1e49309672b244bdc4ff62a270407000200000000000000000702': {
    id: 'xave',
    title: 'brandedRedirect.xave.title',
    description: 'brandedRedirect.xave.description',
    btnText: 'brandedRedirect.xave.btnText',
    link: 'https://xave.co/',
  },
};

const BRANDED_REDIRECTS_BY_NETWORK = {
  [Network.POLYGON]: POLYGON_BRANDED_REDIRECTS,
};

export const BRANDED_REDIRECTS: BrandedRedirects = BRANDED_REDIRECTS_BY_NETWORK[
  networkId.value
]
  ? BRANDED_REDIRECTS_BY_NETWORK[networkId.value]
  : {};
