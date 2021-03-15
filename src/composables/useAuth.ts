import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export default function useAuth() {
  return getInstance();
}
