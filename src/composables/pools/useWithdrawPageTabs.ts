import { ref } from 'vue';

export enum Tab {
  PoolTokens,
  SingleToken,
}

export const tabs = [
  { value: Tab.PoolTokens, label: 'Pool Tokens (proportional)' },
  {
    value: Tab.SingleToken,
    label: 'Single Token',
  },
];

const activeTab = ref(tabs[0].value);

function resetTabs() {
  activeTab.value = tabs[0].value;
}

export default function useWithdrawPageTabs() {
  return { activeTab, resetTabs };
}
