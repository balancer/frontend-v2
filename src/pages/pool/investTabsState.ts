import { ref } from 'vue';

export enum Tabs {
  POOL_TOKENS = 'poolTokens',
  SINGLE_TOKEN = 'singleToken',
}
export const tabs = [
  { value: Tabs.POOL_TOKENS, label: 'Pool Tokens' },
  {
    value: Tabs.SINGLE_TOKEN,
    label: 'Single Token',
  },
];

export const activeTab = ref<Tabs>(tabs[0].value);
