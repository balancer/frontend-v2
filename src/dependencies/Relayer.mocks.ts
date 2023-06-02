import { initRelayer } from './Relayer';
import { Relayer } from '@balancer-labs/sdk';

export const defaultRelayerSignature = 'test relayer signature';

export class MockedRelayer extends Relayer {
  static async signRelayerApproval() {
    return defaultRelayerSignature;
  }
}

export function initRelayerWithDefaultMocks() {
  initRelayer(MockedRelayer);
}
