import { IS_DEV, IS_STAGING } from '@/constants/env';

import { OrderID } from './types';

export default class CowswapExplorerService {
  baseURL: string;

  constructor() {
    if (IS_DEV) {
      this.baseURL = 'https://explorer.cow.fi';
    } else if (IS_STAGING) {
      this.baseURL = 'https://explorer.cow.fi';
    } else {
      this.baseURL = 'https://explorer.cow.fi';
    }
  }

  public orderLink(orderId: OrderID) {
    return `${this.baseURL}/orders/${orderId}`;
  }
}

export const cowswapExplorer = new CowswapExplorerService();
