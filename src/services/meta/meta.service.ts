import { RouteComponent } from 'vue-router';
import { ROUTE_META_DATA } from './meta.constants';

interface IMetaService {
  setMeta(route: RouteComponent | string): any;
}

class MetaService implements IMetaService {
  public setMeta(route: RouteComponent): void {
    const descriptionMeta = document.querySelector('meta[name=description]');
    const keywordsMeta = document.querySelector('meta[name=keywords]');

    if (!route.name || !ROUTE_META_DATA[route.name]) return;

    const { metaTitle, metaDescription, metaKeywords } =
      ROUTE_META_DATA[route.name];

    if (metaTitle) {
      document.title = metaTitle;
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
