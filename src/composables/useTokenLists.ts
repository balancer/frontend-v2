import { getTokensListProvision } from '@/providers/token-lists.provider';

export default function useTokenLists() {
  return getTokensListProvision();
}
