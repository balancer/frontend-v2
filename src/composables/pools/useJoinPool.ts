import { inject } from 'vue';

import {
  JoinPoolProviderSymbol,
  Response,
} from '@/providers/local/join-pool.provider';

const defaultResponse = {} as Response;

export default function useJoinPool(): Response {
  return inject(JoinPoolProviderSymbol, defaultResponse);
}
