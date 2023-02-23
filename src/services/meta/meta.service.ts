import useNetwork from '@/composables/useNetwork';
import { Config } from '@/lib/config';
import { RouteLocationNormalized } from 'vue-router';
import { ROUTE_META_DATA } from './meta.constants';

interface IMetaService {
  setMeta(route: RouteLocationNormalized | string): void;
}

class MetaService implements IMetaService {
  networkConfig: Config;
  constructor() {
    const { networkConfig: _networkConfig } = useNetwork();
    this.networkConfig = _networkConfig;
  }

  public setMeta(route: RouteLocationNormalized): void {
    const descriptionMeta = document.querySelector('meta[name=description]');
    const keywordsMeta = document.querySelector('meta[name=keywords]');

    if (!route.name || !ROUTE_META_DATA[route.name]) return;

    const { metaTitle, metaDescription, metaKeywords } =
      ROUTE_META_DATA[route.name];

    if (metaTitle) {
      document.title = metaTitle.replace(
        '[network_name]',
        this.networkConfig.name
      );
    }

    if (metaDescription) {
      descriptionMeta?.setAttribute('content', metaDescription);
    }

    if (metaKeywords) {
      keywordsMeta?.setAttribute('content', metaKeywords);
    }
  }
}

const metaService = new MetaService();
export default metaService;
