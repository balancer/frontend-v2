import { RouteLocationNormalized } from 'vue-router';
import { configService } from '../config/config.service';
import { OG_META_DATA, ROUTE_META_DATA } from './meta.constants';

interface IMetaService {
  setMeta(route: RouteLocationNormalized | string): void;
  setOgImage(poolId: string): void;
}

class MetaService implements IMetaService {
  constructor(private readonly config = configService) {}

  public setMeta(route: RouteLocationNormalized): void {
    const descriptionMeta = document.querySelector('meta[name=description]');
    const keywordsMeta = document.querySelector('meta[name=keywords]');

    if (!route.name || !ROUTE_META_DATA[route.name]) {
      document.title = 'Balancer';
      descriptionMeta?.setAttribute(
        'content',
        'A UI that supports core Balancer protocol functionality. Explore & create pools, manage liquidity, swap tokens, get veBAL and claim incentives.'
      );
      return;
    }
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

  public setOgImage(poolId: string): void {
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    const metaData = OG_META_DATA[poolId];

    if (!ogImageTag || !metaData) {
      return;
    }

    ogImageTag.setAttribute('content', metaData.imageUrl);
  }
}

const metaService = new MetaService();
export default metaService;
