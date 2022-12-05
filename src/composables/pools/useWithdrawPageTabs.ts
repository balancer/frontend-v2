import { ref } from 'vue';

export enum Tab {
  PoolTokens,
  SingleToken,
}

export const tabs = [
  { value: Tab.PoolTokens, label: 'Pool tokens (proportional)' },
  {
    value: Tab.SingleToken,
    label: 'Single token',
  },
];

const activeTab = ref(tabs[0].value);

function resetTabs() {
  activeTab.value = tabs[0].value;
}

export default function useWithdrawPageTabs() {
  return { activeTab, resetTabs };
}
