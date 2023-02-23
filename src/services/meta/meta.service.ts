import { RouteLocationNormalized } from 'vue-router';
import { configService } from '../config/config.service';
import { ROUTE_META_DATA } from './meta.constants';

interface IMetaService {
  setMeta(route: RouteLocationNormalized | string): void;
}

class MetaService implements IMetaService {
  constructor(private readonly config = configService) {}

  public setMeta(route: RouteLocationNormalized): void {
    const descriptionMeta = document.querySelector('meta[name=description]');
    const keywordsMeta = document.querySelector('meta[name=keywords]');

    if (!route.name || !ROUTE_META_DATA[route.name]) return;

    const { metaTitle, metaDescription, metaKeywords } =
      ROUTE_META_DATA[route.name];

    if (metaTitle) {
      document.title = metaTitle.replace(
        '[network_name]',
        this.config.network.name
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
