import { IS_DEV, IS_STAGING } from '@/constants/env';

import { OrderID } from './types';

export default class GnosisExplorerService {
  baseURL: string;

  constructor() {
    if (IS_DEV) {
      this.baseURL = 'https://protocol-explorer.dev.gnosisdev.com';
    } else if (IS_STAGING) {
      this.baseURL = 'https://protocol-explorer.staging.gnosisdev.com';
    } else {
      this.baseURL = 'https://explorer.cow.fi';
    }
  }

  public orderLink(orderId: OrderID) {
    return `${this.baseURL}/orders/${orderId}`;
  }
}

export const gnosisExplorer = new GnosisExplorerService();
