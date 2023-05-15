import { poolMetadata } from '@/lib/config/metadata';
import { RouteLocationNormalized } from 'vue-router';
import { configService } from '../config/config.service';
import { ROUTE_META_DATA } from './meta.constants';

interface IMetaService {
  setMeta(route: RouteLocationNormalized | string): void;
}

// We use this interface to avoid importing Pool type from SDK while it is not tree-shakable
interface Pool {
  id: string;
  name: string;
  poolType: string;
  symbol?: string;
}

class MetaService implements IMetaService {
  constructor(private readonly config = configService) {}

  public setMeta(route: RouteLocationNormalized, pool?: Pool): void {
    if (!route.name || !ROUTE_META_DATA[route.name]) {
      this.setDefaultMeta();
      return;
    }

    const descriptionMeta = document.querySelector('meta[name=description]');
    const keywordsMeta = document.querySelector('meta[name=keywords]');

    const { metaKeywords } = ROUTE_META_DATA[route.name];
    let { metaTitle, metaDescription } = ROUTE_META_DATA[route.name];

    // Replace pool specific meta data
    if (route.name === 'pool' && pool) {
      metaTitle = metaTitle.replace(
        '[pool_symbol]',
        poolMetadata(pool.id)?.name || pool.symbol || 'Pool'
      );
      metaDescription = metaDescription
        .replace('[pool_type]', pool.poolType)
        .replace('[pool_name]', pool.name);
    }

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

  private setDefaultMeta(): void {
    const descriptionMeta = document.querySelector('meta[name=description]');

    document.title = 'Balancer';
    descriptionMeta?.setAttribute(
      'content',
      'A UI that supports core Balancer protocol functionality. Explore & create pools, manage liquidity, swap tokens, get veBAL and claim incentives.'
    );
  }
}

const metaService = new MetaService();
export default metaService;
