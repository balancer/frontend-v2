import { ref } from 'vue';

export default function useUserSettings() {
  return {
    currency: ref('usd'),
  };
}
